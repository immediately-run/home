import { describe, expect, it } from 'vitest';
import { primary } from './primary';

describe('primary', () => {
  it('no recents puts the gradient on the create door', () => {
    expect(primary({ hasRecents: false, omniboxOpen: false })).toBe('create');
  });

  it('recents put the gradient on the featured project', () => {
    expect(primary({ hasRecents: true, omniboxOpen: false })).toBe('recents');
  });

  it('the omnibox wins over both while it is open', () => {
    expect(primary({ hasRecents: true, omniboxOpen: true })).toBe('omnibox');
    expect(primary({ hasRecents: false, omniboxOpen: true })).toBe('omnibox');
  });
});
