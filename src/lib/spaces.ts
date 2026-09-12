import type { SpaceInfo } from '@immediately-run/sdk';

// The spaces section's decision layer — which of the three states renders and
// what a row carries. Pure: the optional fields the `spaces:user` leg may
// omit (`SpaceInfo.name`, `SpaceInfo.role`) are normalised here, the one place
// a component would otherwise grow a `?? ''` (R13).

export interface SpacesRefusal {
  code: string;
}

export interface SpaceRow {
  spaceId: string;
  name: string;
  role: string;
}

export type SpacesState =
  | { kind: 'empty' }
  | { kind: 'off' }
  | { kind: 'list'; rows: SpaceRow[] };

/**
 * The one decision of which spaces surface renders. An empty list is
 * `empty` (the brief's sentence — distinct from a refusal). A refusal with
 * code `forbidden` (a fork that was declined consent, or an app the binding
 * does not carry `spaces:user` for yet) is `off`. Anything else rethrows: a
 * swallowed failure must not become the "this fork was declined" story (R3,
 * the same rule the recents section applies).
 */
export function spacesState(result: SpaceInfo[] | SpacesRefusal): SpacesState {
  if ('code' in result) {
    if (result.code === 'forbidden') return { kind: 'off' };
    throw new Error(`space list failed: ${result.code}`);
  }
  if (result.length === 0) return { kind: 'empty' };
  return {
    kind: 'list',
    rows: result.map((space) => ({
      spaceId: space.spaceId,
      name: space.name ?? space.spaceId,
      role: space.role ?? '',
    })),
  };
}
