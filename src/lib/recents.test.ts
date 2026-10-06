import { describe, expect, it } from 'vitest';
import type { RecentProject } from '@immediately-run/sdk';
import { asRefusal, recentsHue, recentsState, relativeOpened } from './recents';

// Built field-by-field against the SDK's exported record type, so a field the
// platform adds or renames breaks this construction at compile time (the same
// discipline routes.test.ts uses for the URL grammar).
const project: RecentProject = {
  provider: 'github',
  namespace: 'acme',
  repository: 'todo',
  ref: 'feat/x',
  ts: 0,
};

describe('recentsState', () => {
  it('null is absent — cleared is absent, never an empty list (R-OSO-22)', () => {
    expect(recentsState(null)).toEqual({ kind: 'absent' });
  });

  it('an empty list is absent too — the SDK never sends one, and no state renders an empty container', () => {
    expect(recentsState([])).toEqual({ kind: 'absent' });
  });

  it('a forbidden refusal is off', () => {
    expect(recentsState({ code: 'forbidden' })).toEqual({ kind: 'off', declined: false });
  });

  it('a declined consent is off — the user answered Not now', () => {
    expect(recentsState({ code: 'cancelled' })).toEqual({ kind: 'off', declined: true });
  });

  it('a rejection that carries no code is failed as unknown, never a throw', () => {
    for (const err of [new Error('transport'), {}, 'boom', undefined, null, { code: 7 }]) {
      expect(recentsState(asRefusal(err))).toEqual({ kind: 'failed', code: 'unknown' });
    }
  });

  it('any other refusal code is failed with its code — never off, and never a throw that takes the page', () => {
    expect(recentsState({ code: 'invalid-params' })).toEqual({ kind: 'failed', code: 'invalid-params' });
    expect(recentsState({ code: 'timeout' })).toEqual({ kind: 'failed', code: 'timeout' });
  });

  it('a list splits featured (newest first) from rest', () => {
    const second: RecentProject = { ...project, namespace: 'immediately-run', repository: 'grove', ref: 'main' };
    const third: RecentProject = { ...project, namespace: 'acme', repository: 'expense-tracker', ref: 'main' };
    const state = recentsState([project, second, third]);
    expect(state).toEqual({ kind: 'list', featured: project, rest: [second, third] });
  });
});

describe('relativeOpened', () => {
  const now = 1_800_000_000_000;

  it('pins the words against a fixed now, never the clock', () => {
    expect(relativeOpened(now - 7_200_000, now)).toBe('opened 2 hours ago');
    expect(relativeOpened(now - 86_400_000, now)).toBe('opened yesterday');
    expect(relativeOpened(now - 3 * 86_400_000, now)).toBe('opened 3 days ago');
  });

  it('the near buckets stay honest at their boundaries', () => {
    expect(relativeOpened(now - 30_000, now)).toBe('opened just now');
    expect(relativeOpened(now - 60_000, now)).toBe('opened 1 minute ago');
    expect(relativeOpened(now - 3_600_000, now)).toBe('opened 1 hour ago');
    expect(relativeOpened(now - 2 * 86_400_000, now)).toBe('opened 2 days ago');
  });

  it('a timestamp in the future clamps to just now rather than counting up', () => {
    expect(relativeOpened(now + 5_000, now)).toBe('opened just now');
  });
});

describe('recentsHue', () => {
  it('is deterministic per repository coordinates', () => {
    expect(recentsHue(project)).toBe(recentsHue({ ...project }));
    expect(recentsHue(project)).not.toBe(recentsHue({ ...project, repository: 'grove' }));
  });

  it('lands in [0, 360)', () => {
    for (const repository of ['todo', 'grove', 'expense-tracker', 'whiteboard', 'a', 'zzzzzzzzzz']) {
      const hue = recentsHue({ ...project, repository });
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });
});
