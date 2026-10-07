import { useEffect, useState } from '@lynx-js/react';

import type { Level, Task } from '../lib/plan.js';
import { clampMin, hm } from '../lib/plan.js';
import type { Tr } from '../lib/i18n.js';
import { dur, levelKey } from '../lib/i18n.js';
import { Button, Dot, IconButton, LevelPicker, Pill, Stepper } from './ui.js';

function TimeCell(props: { from: number; to: number }) {
  return (
    <view className="time">
      <text className="time-from">{hm(props.from)}</text>
      <text className="time-to">{hm(props.to)}</text>
    </view>
  );
}

export function TaskRow(props: {
  task: Task; index: number; from: number; to: number; active: boolean;
  canUp: boolean; canDown: boolean; tr: Tr;
  onUp: () => void; onDown: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { task, index, active, tr } = props;
  const state = task.done ? ' row--done' : active ? ' row--active' : '';
  return (
    <view className={'row' + state}>
      <TimeCell from={props.from} to={props.to} />
      <view className="row-main">
        <text className={`row-name${task.done ? ' row-name--done' : active ? ' row-name--active' : ''}`}>
          {`${index + 1}. ${task.name}`}
        </text>
        <view className="meta">
          <Dot pr={task.pr} />
          <text className="meta-text">{`${tr(levelKey(task.pr))} · ${dur(tr, task.min)}`}</text>
        </view>
        <view className="row-foot">
          <Pill
            label={tr(task.done ? 'stDone' : active ? 'stActive' : 'stWait')}
            tone={task.done ? 'done' : active ? 'active' : 'muted'}
          />
          <view className="acts">
            <IconButton icon="↑" disabled={!props.canUp} onTap={props.onUp} />
            <IconButton icon="↓" disabled={!props.canDown} onTap={props.onDown} />
            <IconButton icon="✎" onTap={props.onEdit} />
            <IconButton icon="✕" danger onTap={props.onDelete} />
          </view>
        </view>
      </view>
    </view>
  );
}

export function EditRow(props: {
  task: Task; from: number; to: number; tr: Tr;
  onSave: (name: string, min: number, pr: Level) => void; onCancel: () => void;
}) {
  const { task, tr } = props;
  const [name, setName] = useState(task.name);
  const [min, setMin] = useState(task.min);
  const [pr, setPr] = useState<Level>(task.pr);

  // default-value Android'da ishlaydi, brauzer preview'i uchun setValue ham chaqiramiz
  useEffect(() => {
    lynx.createSelectorQuery()
      .select('#editName')
      .invoke({ method: 'setValue', params: { value: task.name } })
      .exec();
  }, [task.id]);

  const save = () => {
    const v = name.trim();
    if (v) props.onSave(v, min, pr);
  };

  return (
    <view className="row row--editing">
      <TimeCell from={props.from} to={props.to} />
      <view className="row-main edit">
        <input
          id="editName"
          className="field"
          default-value={task.name}
          maxlength={60}
          confirm-type="done"
          bindinput={(e) => setName(e.detail.value)}
          bindconfirm={save}
        />
        <Stepper
          value={`${min} ${tr('min')}`}
          onMinus={() => setMin(clampMin(min - 5))}
          onPlus={() => setMin(clampMin(min + 5))}
        />
        <LevelPicker value={pr} onChange={setPr} tr={tr} />
        <view className="btn-row">
          <Button kind="primary" small label={tr('save')} onTap={save} disabled={!name.trim()} />
          <Button small label={tr('cancel')} onTap={props.onCancel} />
        </view>
      </view>
    </view>
  );
}
