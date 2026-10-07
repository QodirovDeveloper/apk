import { useEffect, useRef, useState } from '@lynx-js/react';

import './App.css';
import { EditRow, TaskRow } from './components/TaskRow.js';
import { Button, LevelPicker, Pill, Stepper, Toggle } from './components/ui.js';
import type { Key } from './lib/i18n.js';
import { TEMPLATES, dur, levelKey, makeTr, today } from './lib/i18n.js';
import { keepAwake, loadState, ring, saveState } from './lib/native.js';
import * as P from './lib/plan.js';

const APP_NAME = 'Time management';
const LANGS: P.Lang[] = ['uz', 'ru', 'en'];

type Toast = { key: Key; undo: boolean; id: number };

export function App() {
  const [S, setS] = useState<P.State | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newMin, setNewMin] = useState(30);
  const [newPr, setNewPr] = useState<P.Level>(2);
  const [addKey, setAddKey] = useState(0); // o'zgarsa input qayta yaratiladi va tozalanadi
  const [toast, setToast] = useState<Toast | null>(null);
  const undoRef = useRef<P.State | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Saqlangan holatni yuklash (Android: SharedPreferences)
  useEffect(() => {
    loadState((raw) => setS(P.parse(raw, new Date())));
  }, []);

  // Soat: har yarim soniyada qayta chizamiz
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const apply = (next: P.State) => {
    setS(next);
    saveState(JSON.stringify(next));
  };

  // Vaqt tugadi: qo'ng'iroq va keyingi bosqich
  useEffect(() => {
    if (S && S.running && P.remaining(S, now) <= 0) {
      if (S.sound) ring();
      apply(P.finishPhase(S, Date.now()));
    }
  }, [now, S]);

  // Taymer ishlayotganda ekran o'chmasin
  useEffect(() => {
    if (S) keepAwake(S.running);
  }, [S?.running]);

  if (!S) {
    return (
      <view className="root root--center">
        <text className="h1">{APP_NAME}</text>
      </view>
    );
  }

  const lang: P.Lang = S.lang ?? 'uz';
  const tr = makeTr(lang);

  const showToast = (key: Key, withUndo = false) => {
    if (!withUndo) undoRef.current = null;
    setToast({ key, undo: withUndo, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      undoRef.current = null;
    }, withUndo ? 6000 : 2500);
  };

  const applyResult = (res: { state: P.State; restarted: boolean }, okKey?: Key) => {
    apply(res.state);
    if (res.restarted) showToast('orderChanged');
    else if (okKey) showToast(okKey);
  };

  // ---------- Vazifalar ----------
  const addTask = () => {
    const name = newName.trim();
    if (!name) {
      showToast('emptyName');
      return;
    }
    applyResult(P.addTask(S, name, newMin, newPr), 'added');
    setNewName('');
    setAddKey(addKey + 1);
  };

  const removeTask = (id: string) => {
    undoRef.current = S;
    if (editId === id) setEditId(null);
    apply(P.removeTask(S, id).state);
    showToast('deleted', true);
  };

  const undo = () => {
    if (undoRef.current) apply(undoRef.current);
    undoRef.current = null;
    setToast(null);
  };

  const loadTemplate = (i: number) => {
    const tpl = TEMPLATES[lang][i];
    if (!tpl) return;
    apply(P.resetProgress(S, tpl.tasks.map(([name, min, pr]) => ({ id: P.uid(), name, min, pr, done: false }))));
    showToast('templateLoaded');
  };

  const clearAll = () => {
    undoRef.current = S;
    setEditId(null);
    apply(P.resetProgress(S, []));
    showToast('cleared', true);
  };

  // ---------- Taymer ----------
  const empty = S.tasks.length === 0;
  const done = P.allDone(S);
  const brk = S.phase === 'brk';
  const r = empty ? 0 : P.remaining(S, now);
  const pct = done ? 100 : empty ? 0 : Math.min(100, Math.max(0, 100 * (1 - r / P.total(S))));
  const cur = P.current(S);
  const next = S.tasks[S.cur + 1];

  let label: string, title: string, sub: string;
  if (empty) {
    label = tr('now'); title = tr('noTasks'); sub = tr('noTasksHint');
  } else if (done) {
    label = tr('dayDone'); title = tr('allDone');
    sub = tr('stats', { n: S.tasks.length, t: dur(tr, S.tasks.reduce((a, t) => a + t.min, 0)) });
  } else if (brk) {
    label = tr('brk'); title = tr('breakText'); sub = next ? tr('next', { name: next.name }) : '';
  } else {
    label = tr('now'); title = cur?.name ?? '';
    sub = `${tr(levelKey(cur?.pr ?? 2))} · ` + (next ? tr('next', { name: next.name }) : tr('lastOne'));
  }

  const startLabel = tr(S.running ? 'pause' : !empty && r < P.total(S) ? 'resume' : 'start');
  const plan = P.schedule(S);
  const phaseCls = done ? ' now--done' : brk ? ' now--brk' : '';

  return (
    <view className="root">
      <scroll-view scroll-orientation="vertical" className="scroll">
        <view className="wrap">
          {/* Sarlavha va til */}
          <view className="header">
            <view className="header-top">
              <text className="eyebrow">{today(lang, new Date(now))}</text>
              <view className="lang">
                {LANGS.map((l) => (
                  <view key={l} className={`lang-btn${l === lang ? ' lang-btn--on' : ''}`} bindtap={() => apply({ ...S, lang: l })}>
                    <text className={`lang-text${l === lang ? ' lang-text--on' : ''}`}>{l.toUpperCase()}</text>
                  </view>
                ))}
              </view>
            </view>
            <text className="h1">{APP_NAME}</text>
            <text className="sub">{tr('tagline')}</text>
          </view>

          {/* Yangi foydalanuvchi uchun yo'riqnoma */}
          {!S.helpSeen && (
            <view className="help">
              <text className="h2">{tr('helpTitle')}</text>
              {(['step1', 'step2', 'step3'] as Key[]).map((k, i) => (
                <view key={k} className="step-row">
                  <view className="step-num"><text className="step-num-text">{String(i + 1)}</text></view>
                  <text className="step-text-help">{tr(k)}</text>
                </view>
              ))}
              <Button kind="primary" label={tr('gotIt')} onTap={() => apply({ ...S, helpSeen: true })} />
            </view>
          )}

          {/* Hozirgi vazifa va taymer */}
          <view className={'card now' + phaseCls}>
            <view className="now-top">
              <view className="now-text">
                <text className={'eyebrow' + (brk && !done ? ' eyebrow--brk' : done ? ' eyebrow--done' : '')}>{label}</text>
                <text className="now-name">{title}</text>
                <text className="now-sub">{sub}</text>
              </view>
              {!empty && <Pill label={tr('progress', { d: P.doneCount(S), n: S.tasks.length })} tone={done ? 'done' : 'muted'} />}
            </view>
            <text className={'clock' + (done ? ' clock--done' : brk ? ' clock--brk' : '')}>{done ? '✓' : P.fmt(r)}</text>
            <view className="bar">
              <view className={'bar-fill' + (done ? ' bar-fill--done' : brk ? ' bar-fill--brk' : '')} style={{ width: `${pct}%` }} />
            </view>
            <view className="btn-row">
              <Button kind="primary" label={startLabel} disabled={done || empty} onTap={() => apply(P.toggleRun(S, Date.now()))} />
              <Button
                label={tr('doneNext')}
                disabled={done || empty || brk}
                onTap={() => apply(P.finishPhase({ ...S, left: P.remaining(S, Date.now()) }, Date.now()))}
              />
              {brk && !done && (
                <Button label={tr('skipBreak')} onTap={() => apply(P.finishPhase({ ...S, left: 0 }, Date.now()))} />
              )}
              <Button
                kind="ghost"
                label={tr('restart')}
                disabled={empty || !P.started(S)}
                onTap={() => {
                  apply(P.resetProgress(S, S.tasks));
                  showToast('restarted');
                }}
              />
            </view>
          </view>

          {/* Kun sozlamalari */}
          <view className="card settings">
            <text className="h2">{tr('settings')}</text>
            <view className="set-row">
              <text className="set-label">{tr('startAt')}</text>
              <view className="set-ctrl">
                <Stepper
                  value={S.start}
                  onMinus={() => apply({ ...S, start: P.hm(P.toMin(S.start) - 5) })}
                  onPlus={() => apply({ ...S, start: P.hm(P.toMin(S.start) + 5) })}
                />
                <Button kind="link" small label={tr('nowTime')} onTap={() => apply({ ...S, start: P.roundNow(new Date()) })} />
              </view>
            </view>
            <view className="set-row">
              <text className="set-label">{tr('breakLen')}</text>
              <Stepper
                value={`${S.brk} ${tr('min')}`}
                onMinus={() => apply(P.setBreak(S, S.brk - 5))}
                onPlus={() => apply(P.setBreak(S, S.brk + 5))}
              />
            </view>
            <view className="set-row">
              <text className="set-label">{tr('sound')}</text>
              <Toggle
                on={S.sound}
                onTap={() => {
                  if (!S.sound) ring();
                  apply({ ...S, sound: !S.sound });
                }}
              />
            </view>
            {S.helpSeen && <Button kind="link" small label={tr('showHelp')} onTap={() => apply({ ...S, helpSeen: false })} />}
          </view>

          {/* Vazifalar */}
          <view className="tasks-head">
            <text className="h2">{tr('tasksTitle')}</text>
            {!empty && <text className="total">{tr('total', { t: dur(tr, plan.sum), end: P.hm(plan.end) })}</text>}
          </view>

          <view className="card add">
            <input
              key={addKey}
              id="newName"
              className="field"
              placeholder={tr('addPlaceholder')}
              maxlength={60}
              confirm-type="done"
              bindinput={(e) => setNewName(e.detail.value)}
              bindconfirm={addTask}
            />
            <Stepper
              value={`${newMin} ${tr('min')}`}
              onMinus={() => setNewMin(P.clampMin(newMin - 5))}
              onPlus={() => setNewMin(P.clampMin(newMin + 5))}
            />
            <LevelPicker value={newPr} onChange={setNewPr} tr={tr} />
            <Button kind="primary" label={tr('add')} onTap={addTask} />
          </view>

          {empty ? (
            <view className="empty">
              <text className="empty-text">{tr('empty')}</text>
              <view className="chips">
                {TEMPLATES[lang].map((tpl, i) => (
                  <view key={tpl.label} className="tpl" bindtap={() => loadTemplate(i)}>
                    <text className="tpl-label">{tpl.label}</text>
                    <text className="tpl-dur">{dur(tr, tpl.tasks.reduce((a, t) => a + t[1], 0))}</text>
                  </view>
                ))}
              </view>
            </view>
          ) : (
            <view className="plan">
              {plan.slots.map((slot) => {
                if (slot.kind === 'brk') {
                  const isNow = slot.index === S.cur && brk && !done;
                  return (
                    <view key={'b' + slot.index} className={'brkrow' + (isNow ? ' brkrow--now' : '')}>
                      <text className={'brk-text' + (isNow ? ' brk-text--now' : '')}>
                        {`${isNow ? '▸ ' : ''}${tr('breakRow', { m: S.brk })} · ${P.hm(slot.from)}–${P.hm(slot.to)}`}
                      </text>
                    </view>
                  );
                }
                const i = slot.index;
                const task = S.tasks[i]!;
                if (task.id === editId) {
                  return (
                    <EditRow
                      key={task.id}
                      task={task}
                      from={slot.from}
                      to={slot.to}
                      tr={tr}
                      onCancel={() => setEditId(null)}
                      onSave={(name, min, pr) => {
                        setEditId(null);
                        applyResult(P.editTask(S, task.id, name, min, pr, Date.now()));
                      }}
                    />
                  );
                }
                const prev = S.tasks[i - 1], nxt = S.tasks[i + 1];
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    index={i}
                    from={slot.from}
                    to={slot.to}
                    active={i === S.cur && S.phase === 'work' && !task.done}
                    canUp={!!prev && prev.pr === task.pr}
                    canDown={!!nxt && nxt.pr === task.pr}
                    tr={tr}
                    onUp={() => applyResult(P.moveTask(S, i, -1))}
                    onDown={() => applyResult(P.moveTask(S, i, 1))}
                    onEdit={() => setEditId(task.id)}
                    onDelete={() => removeTask(task.id)}
                  />
                );
              })}
            </view>
          )}

          {!empty && <Button kind="link" small label={tr('clearAll')} onTap={clearAll} />}
          <text className="tip">{tr('privacy')}</text>
        </view>
      </scroll-view>

      {toast && (
        <view className="toast">
          <text className="toast-text">{tr(toast.key)}</text>
          {toast.undo && (
            <view className="toast-btn" bindtap={undo}>
              <text className="toast-undo">{tr('undo')}</text>
            </view>
          )}
        </view>
      )}
    </view>
  );
}
