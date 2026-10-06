import type { RecentProject } from '@immediately-run/sdk';

// The recents section's decision layer — which of its states renders,
// how the list splits into featured + rest, and how a timestamp reads as
// words. Pure and clock-free: `now` is always an argument, so the tests pin
// it. The component layer (RecentProjects) only renders what a function from
// this module decided (R13).

/** A refused read: the typed error's code, never its message (R3). */
export interface RecentRefusal {
  code: string;
}

/**
 * Whatever the read rejected with, as a refusal. The SDK's typed errors carry a
 * string `code`; a bare Error, a string or nothing at all (a transport fault)
 * carries none, and reads as `unknown` so it still lands in a state rather than
 * in a throw.
 */
export function asRefusal(err: unknown): RecentRefusal {
  const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code: unknown }).code : undefined;
  return { code: typeof code === 'string' && code !== '' ? code : 'unknown' };
}

export type RecentsState =
  | { kind: 'absent' }
  | { kind: 'off'; declined: boolean }
  | { kind: 'failed'; code: string }
  | { kind: 'list'; featured: RecentProject; rest: RecentProject[] };

/**
 * The one decision of which recents surface renders. `null` (cleared or
 * never-used) is absent: never an empty list, never an empty-state note
 * (R-OSO-22). A refusal the user or the host meant is off: `forbidden` (a
 * fork that has not been consented, or an app that is not the page.home
 * binding) and `cancelled` (the user answered the consent with Not now, which
 * the section words as the user's own choice). Any other code is failed, with
 * its code: shown in the section and logged there, never read as off (which
 * would hide the bug) and never thrown, since a throw takes the whole page
 * down for one optional section.
 */
export function recentsState(result: RecentProject[] | null | RecentRefusal): RecentsState {
  if (result === null) return { kind: 'absent' };
  if (!Array.isArray(result)) {
    const { code } = asRefusal(result);
    if (code === 'forbidden') return { kind: 'off', declined: false };
    if (code === 'cancelled') return { kind: 'off', declined: true };
    return { kind: 'failed', code };
  }
  if (result.length === 0) return { kind: 'absent' };
  return { kind: 'list', featured: result[0], rest: result.slice(1) };
}

/** `opened 2 hours ago`, `opened yesterday`, `opened 3 days ago`. */
export function relativeOpened(ts: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - ts) / 1000));
  if (seconds < 60) return 'opened just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `opened ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days === 0) return `opened ${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'opened yesterday';
  return `opened ${days} days ago`;
}

/** A stable hue in [0, 360) from the repository coordinates — the decorative
 *  mark's wash, derived and never fetched. Same repo, same hue, every load. */
export function recentsHue(project: RecentProject): number {
  const key = `${project.namespace}/${project.repository}`;
  let hash = 5381;
  for (let i = 0; i < key.length; i += 1) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}
