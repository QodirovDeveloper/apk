// Kun rejasi mantiqi. UI'ga bog'liq emas: har bir funksiya yangi holat qaytaradi.

export type Level = 1 | 2 | 3; // 1 = eng muhim, 3 = keyinroq
export type Phase = 'work' | 'brk';
export type Lang = 'ru' | 'uz' | 'en';

export interface Task {
  id: string;
  name: string;
  min: number;
  pr: Level;
  done: boolean;
}

// tasks: doim pr bo'yicha tartiblangan (eng muhimi tepada)
// cur: joriy vazifa; phase "brk" = cur'dan keyingi tanaffus
// running bo'lsa vaqt endAt (ms) gacha, pauzada esa left (soniya)
export interface State {
  tasks: Task[];
  cur: number;
  phase: Phase;
  left: number;
  running: boolean;
  endAt: number;
  start: string;
  brk: number;
  sound: boolean;
  helpSeen: boolean;
  lang: Lang | null;
}

export const pad = (n: number) => String(n).padStart(2, '0');

export function fmt(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
}

// daqiqalarni "HH:MM" ga, sutka chegarasidan o'tsa ham
export function hm(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
}

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export const clampMin = (v: number) => Math.min(300, Math.max(5, Math.round(v)));
export const clampBrk = (v: number) => Math.min(60, Math.max(0, Math.round(v)));

export function roundNow(now: Date): string {
  return hm(Math.ceil((now.getHours() * 60 + now.getMinutes()) / 5) * 5);
}

// Barqaror saralash: bitta daraja ichida tartib saqlanadi
export const byLevel = (list: Task[]) =>
  list.map((t, i) => ({ t, i })).sort((a, b) => a.t.pr - b.t.pr || a.i - b.i).map((x) => x.t);

let seq = 0;
export const uid = () => Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);

export function blank(now: Date): State {
  return {
    tasks: [], cur: 0, phase: 'work', left: 0, running: false, endAt: 0,
    start: roundNow(now), brk: 10, sound: true, helpSeen: false, lang: null,
  };
}

const copy = (s: State): State => ({ ...s, tasks: s.tasks.map((t) => ({ ...t })) });

export const current = (s: State) => s.tasks[s.cur];
export const remaining = (s: State, now: number) => (s.running ? (s.endAt - now) / 1000 : s.left);
export const total = (s: State) => (s.phase === 'brk' ? s.brk * 60 : (current(s)?.min ?? 1) * 60);
export const allDone = (s: State) => s.tasks.length > 0 && s.tasks.every((t) => t.done);
export const doneCount = (s: State) => s.tasks.filter((t) => t.done).length;

export function started(s: State): boolean {
  const c = current(s);
  return s.running || s.phase === 'brk' || s.tasks.some((t) => t.done) || (!!c && s.left < c.min * 60);
}

// Kunni shu ro'yxat bilan qaytadan boshlash
export function resetProgress(s: State, tasks: Task[]): State {
  const list = byLevel(tasks).map((t) => ({ ...t, done: false }));
  return { ...s, tasks: list, cur: 0, phase: 'work', running: false, endAt: 0, left: (list[0]?.min ?? 0) * 60 };
}

// Yangi ro'yxatni saqlash. Bajarilganlar va joriy vazifa o'z joyida qolsa, progress saqlanadi,
// aks holda kun qaytadan boshlanadi (restarted = true).
export function commit(s: State, tasks: Task[]): { state: State; restarted: boolean } {
  const next = byLevel(tasks);
  if (!started(s)) return { state: resetProgress(s, next), restarted: false };
  const keep = s.tasks.slice(0, s.cur + 1).every((t, i) => next[i]?.id === t.id);
  if (keep) return { state: { ...copy(s), tasks: next }, restarted: false };
  return { state: resetProgress(s, next), restarted: true };
}

export function addTask(s: State, name: string, min: number, pr: Level) {
  return commit(s, [...s.tasks, { id: uid(), name, min: clampMin(min), pr, done: false }]);
}

export function removeTask(s: State, id: string) {
  return commit(s, s.tasks.filter((t) => t.id !== id));
}

export function moveTask(s: State, i: number, dir: -1 | 1) {
  const j = i + dir;
  const a = s.tasks[i], b = s.tasks[j];
  if (!a || !b || a.pr !== b.pr) return { state: s, restarted: false };
  const list = [...s.tasks];
  list[i] = b;
  list[j] = a;
  return commit(s, list);
}

export function editTask(s: State, id: string, name: string, min: number, pr: Level, now: number) {
  const old = s.tasks.find((t) => t.id === id);
  if (!old) return { state: s, restarted: false };
  const newMin = clampMin(min);
  const wasCurrent = current(s)?.id === id && s.phase === 'work' && !old.done && started(s);
  const res = commit(s, s.tasks.map((t) => (t.id === id ? { ...t, name, min: newMin, pr } : t)));
  // Joriy vazifaning daqiqasi o'zgardi: taymerni farqqa suramiz
  if (!res.restarted && wasCurrent) {
    const diff = newMin - old.min;
    const st = res.state;
    if (st.running) st.endAt += diff * 60000;
    else st.left = Math.max(0, st.left + diff * 60);
    if (st.running && st.endAt < now) st.endAt = now;
  }
  return res;
}

export function toggleRun(s: State, now: number): State {
  if (s.running) return { ...s, running: false, left: remaining(s, now) };
  return { ...s, running: true, endAt: now + s.left * 1000 };
}

// Bosqich tugadi: vazifa → tanaffus → keyingi vazifa
export function finishPhase(s: State, now: number): State {
  const n = copy(s);
  if (n.phase === 'work') {
    const c = n.tasks[n.cur];
    if (c) c.done = true;
    if (n.cur >= n.tasks.length - 1) return { ...n, running: false, left: 0 };
    if (n.brk > 0) {
      n.phase = 'brk';
      n.left = n.brk * 60;
    } else {
      n.cur++;
      n.left = n.tasks[n.cur]!.min * 60;
    }
  } else {
    n.phase = 'work';
    n.cur++;
    n.left = n.tasks[n.cur]!.min * 60;
  }
  if (n.running) n.endAt = now + n.left * 1000;
  return n;
}

export function setBreak(s: State, brk: number): State {
  const n = { ...s, brk: clampBrk(brk) };
  if (n.phase === 'brk' && !n.running) n.left = n.brk * 60;
  return n;
}

// Jadval qatorlari: har vazifa va tanaffusning boshlanish/tugash vaqti
export interface Slot { kind: 'task' | 'brk'; index: number; from: number; to: number }
export function schedule(s: State): { slots: Slot[]; sum: number; end: number } {
  let t = toMin(s.start), sum = 0;
  const slots: Slot[] = [];
  s.tasks.forEach((task, i) => {
    slots.push({ kind: 'task', index: i, from: t, to: t + task.min });
    t += task.min;
    sum += task.min;
    if (i < s.tasks.length - 1 && s.brk > 0) {
      slots.push({ kind: 'brk', index: i, from: t, to: t + s.brk });
      t += s.brk;
    }
  });
  return { slots, sum, end: t };
}

export function parse(raw: string | null | undefined, now: Date): State {
  try {
    const s = JSON.parse(raw ?? '') as Partial<State>;
    if (s && Array.isArray(s.tasks)) return { ...blank(now), ...s } as State;
  } catch {
    // buzilgan yozuv: yangidan boshlaymiz
  }
  return blank(now);
}
