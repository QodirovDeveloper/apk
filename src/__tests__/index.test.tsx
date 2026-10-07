import '@testing-library/jest-dom';
import { render } from '@lynx-js/react/testing-library';
import { describe, expect, test } from '@rstest/core';

import { App } from '../App';
import * as P from '../lib/plan';

const NOW = new Date(2026, 9, 7, 14, 2);
const T = NOW.getTime();

function withTasks(...specs: [string, number, P.Level][]) {
  const s = P.blank(NOW);
  return P.resetProgress(s, specs.map(([name, min, pr]) => ({ id: name, name, min, pr, done: false })));
}

test('App: nom va bo\'sh ro\'yxat ko\'rinadi', async () => {
  const { findByText } = render(<App />);
  expect(await findByText('Time management')).toBeInTheDocument();
});

describe('plan', () => {
  test('muhimlik bo\'yicha tartiblaydi, daraja ichida tartib saqlanadi', () => {
    const s = withTasks(['c', 30, 3], ['a', 30, 1], ['b', 30, 2], ['a2', 30, 1]);
    expect(s.tasks.map((t) => t.id)).toEqual(['a', 'a2', 'b', 'c']);
    expect(s.left).toBe(30 * 60);
  });

  test('vazifa → tanaffus → keyingi vazifa → kun yakuni', () => {
    let s = withTasks(['a', 40, 1], ['b', 20, 2]);
    s = P.toggleRun(s, T);
    expect(P.remaining(s, T + 60_000)).toBe(39 * 60);
    s = P.finishPhase(s, T);
    expect(s.phase).toBe('brk');
    expect(s.tasks[0]!.done).toBe(true);
    expect(s.left).toBe(10 * 60);
    s = P.finishPhase(s, T);
    expect(s.phase).toBe('work');
    expect(s.cur).toBe(1);
    s = P.finishPhase(s, T);
    expect(P.allDone(s)).toBe(true);
    expect(s.running).toBe(false);
  });

  test('joriy vazifadan oldinga muhimroq vazifa qo\'shilsa, kun qaytadan boshlanadi', () => {
    let s = withTasks(['a', 30, 2], ['b', 30, 2]);
    s = P.finishPhase(P.toggleRun(s, T), T); // a bajarildi, tanaffus
    const after = P.addTask(s, 'urgent', 15, 1);
    expect(after.restarted).toBe(true);
    expect(after.state.tasks[0]!.name).toBe('urgent');
    expect(after.state.tasks.every((t) => !t.done)).toBe(true);

    const tail = P.addTask(s, 'later', 15, 3);
    expect(tail.restarted).toBe(false);
    expect(tail.state.tasks[0]!.done).toBe(true);
  });

  test('joriy vazifaning daqiqasi o\'zgarsa, taymer farqqa suriladi', () => {
    let s = withTasks(['a', 30, 1]);
    s = P.toggleRun(s, T);
    const res = P.editTask(s, 'a', 'a', 40, 1, T);
    expect(res.restarted).toBe(false);
    expect(P.remaining(res.state, T)).toBe(40 * 60);
  });

  test('jadval vaqtlari va tanaffuslar', () => {
    const s = { ...withTasks(['a', 30, 1], ['b', 45, 2]), start: '23:40' };
    const { slots, sum, end } = P.schedule(s);
    expect(slots.map((x) => `${x.kind}:${P.hm(x.from)}-${P.hm(x.to)}`)).toEqual([
      'task:23:40-00:10', 'brk:00:10-00:20', 'task:00:20-01:05',
    ]);
    expect(sum).toBe(75);
    expect(P.hm(end)).toBe('01:05');
  });

  test('buzilgan saqlangan yozuvdan toza holat', () => {
    expect(P.parse('{oops', NOW).tasks).toEqual([]);
    expect(P.parse(null, NOW).start).toBe('14:05');
  });
});
