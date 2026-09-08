import type { RecentProject } from '@immediately-run/sdk';

// The host's URL grammar: the first path segment names the mode. The closed
// set is WORKBENCH_MODES_SPEC §2's URL column (present, edit, home, spaces,
// notifications, settings, commander); `/` and `/s/*` are the front door —
// an alias of present, not an eighth mode. Every platform path Home links
// to is spelled in this module and nowhere else.

/** The entry file the platform editor opens a repo at. */
const ENTRY = 'src/App.tsx';

/** "Open" — the project in the runner (present mode). */
export function presentRoute(project: RecentProject): string {
  return `/present/${project.provider}/${project.namespace}/${project.repository}/${project.ref}/files/${ENTRY}`;
}

/** "Edit" — the project in the editor (edit mode). */
export function editRoute(project: RecentProject): string {
  return `/edit/${project.provider}/${project.namespace}/${project.repository}/${project.ref}/files/${ENTRY}`;
}

/** The spaces mode, optionally deep-linked at one space. */
export function spacesRoute(spaceId?: string): string {
  return spaceId ? `/spaces/${spaceId}` : '/spaces';
}

/** The settings mode at the language-model section. */
export const SETTINGS_LANGUAGE_MODEL = '/settings/language-model';

/** The notifications mode. */
export const NOTIFICATIONS = '/notifications';

/** The front door's create section (a present-mode alias). */
export const MAKE_AN_APP = '/s/new';

/** The front door. */
export const FRONT_DOOR = '/';

const HOME_COORDINATES: RecentProject = {
  provider: 'github',
  namespace: 'immediately-run',
  repository: 'home',
  ref: 'main',
  ts: 0,
};

/** This app's own sources on GitHub, for a human to read. */
export const HOME_SOURCE = `https://github.com/${HOME_COORDINATES.namespace}/${HOME_COORDINATES.repository}`;

/** This page in the editor — what "fork this page" opens. */
export const HOME_EDIT = editRoute(HOME_COORDINATES);
