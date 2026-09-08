import { describe, expect, it } from 'vitest';
import type { RecentProject } from '@immediately-run/sdk';
import {
  editRoute,
  FRONT_DOOR,
  HOME_EDIT,
  HOME_SOURCE,
  MAKE_AN_APP,
  NOTIFICATIONS,
  presentRoute,
  SETTINGS_LANGUAGE_MODEL,
  spacesRoute,
} from './routes';

// The closed set of mode segments the host's URL grammar allows —
// WORKBENCH_MODES_SPEC §2's URL column. `/` and `/s/*` are the front door
// (an alias of present), not an eighth segment.
const MODE_SEGMENTS = ['present', 'edit', 'home', 'spaces', 'notifications', 'settings', 'commander'] as const;

// Built field-by-field against the SDK's exported record type, so a field the
// platform adds or renames breaks this construction at compile time.
const project: RecentProject = {
  provider: 'github',
  namespace: 'acme',
  repository: 'todo',
  ref: 'main',
  ts: 0,
};

describe('routes', () => {
  it('presentRoute and editRoute build the host grammar from a recent project', () => {
    expect(presentRoute(project)).toBe('/present/github/acme/todo/main/files/src/App.tsx');
    expect(editRoute({ ...project, ref: 'feat/x' })).toBe('/edit/github/acme/todo/feat/x/files/src/App.tsx');
  });

  it("spacesRoute deep-links at one space when given an id (?space= — the manager's selection parameter)", () => {
    expect(spacesRoute()).toBe('/spaces');
    expect(spacesRoute('space-1')).toBe('/spaces?space=space-1');
  });

  it("every route helper's first segment is one of the seven modes", () => {
    for (const path of [presentRoute(project), editRoute(project), spacesRoute(), spacesRoute('space-1'), SETTINGS_LANGUAGE_MODEL, NOTIFICATIONS]) {
      const first = path.split('?')[0].split('/')[1];
      expect(MODE_SEGMENTS).toContain(first);
    }
  });

  it('the tile and create constants spell their modes (the create door is a front-door alias)', () => {
    expect(SETTINGS_LANGUAGE_MODEL).toBe('/settings/language-model');
    expect(NOTIFICATIONS).toBe('/notifications');
    expect(MAKE_AN_APP).toBe('/s/new');
    expect(FRONT_DOOR).toBe('/');
  });

  it('the self links are derived from the same builders, not re-spelled', () => {
    expect(HOME_EDIT).toBe(editRoute({ ...project, namespace: 'immediately-run', repository: 'home' }));
    expect(HOME_EDIT).toBe('/edit/github/immediately-run/home/main/files/src/App.tsx');
    expect(HOME_SOURCE).toBe('https://github.com/immediately-run/home');
  });
});
