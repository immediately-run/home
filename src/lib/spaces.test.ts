import { describe, expect, it } from 'vitest';
import type { SpaceInfo } from '@immediately-run/sdk';
import { spacesState } from './spaces';

// Built field-by-field against the SDK's exported record type, so a field the
// platform adds or renames breaks this construction at compile time — and the
// optional fields the real leg may omit are exercised by the producer's own
// type (`name` and `role` are absent on the third element).
const household: SpaceInfo = { spaceId: 'space-1', name: 'Household', role: 'owner' };
const chessClub: SpaceInfo = { spaceId: 'space-2', name: 'Chess club', role: 'writer' };
const minimal: SpaceInfo = { spaceId: 'space-3' };

describe('spacesState', () => {
  it('an empty list is empty — the sentence, not a refusal', () => {
    expect(spacesState([])).toEqual({ kind: 'empty' });
  });

  it('a forbidden refusal is off', () => {
    expect(spacesState({ code: 'forbidden' })).toEqual({ kind: 'off' });
  });

  it('any other refusal code rethrows — "this fork was declined" must not swallow real failures', () => {
    expect(() => spacesState({ code: 'auth-required' })).toThrow('auth-required');
  });

  it('a list normalises rows, falling back to the spaceId when the leg omits the name', () => {
    const state = spacesState([household, chessClub, minimal]);
    expect(state).toEqual({
      kind: 'list',
      rows: [
        { spaceId: 'space-1', name: 'Household', role: 'owner' },
        { spaceId: 'space-2', name: 'Chess club', role: 'writer' },
        { spaceId: 'space-3', name: 'space-3', role: '' },
      ],
    });
  });
});
