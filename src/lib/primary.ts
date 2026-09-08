// The page's one-gradient-primary rule, as a decision. The brief allows
// exactly one gradient primary; which surface earns it moves as the page's
// state does — the featured recent's Open by default, the create door when
// there are no recents, and the omnibox's Open while the omnibox is open.

export type PrimaryTarget = 'recents' | 'create' | 'omnibox';

export interface PrimaryInputs {
  hasRecents: boolean;
  omniboxOpen: boolean;
}

export function primary({ hasRecents, omniboxOpen }: PrimaryInputs): PrimaryTarget {
  if (omniboxOpen) return 'omnibox';
  return hasRecents ? 'recents' : 'create';
}
