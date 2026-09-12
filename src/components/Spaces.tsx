import { useEffect, useState } from 'react';
// The one call site — exactly one caller per mount, so the grep for the
// platform call lands on a single line (import alias `readSpaces`).
import { listAllSpaces as readSpaces } from '@immediately-run/sdk';
import type { SpaceInfo } from '@immediately-run/sdk';
import { PlatformLink } from '@immediately-run/sdk/platformLink';
import SectionHeading from './SectionHeading';
import SpaceRow from './SpaceRow';
import { spacesState } from '../lib/spaces';
import type { SpacesRefusal, SpacesState } from '../lib/spaces';
import { spacesRoute } from '../lib/routes';
import '../styles/spaces.css';

// The /SPACES section: the user's spaces as a compact list (desktop) or a
// horizontal card strip (phone) — the list and nothing more. Every verb
// beyond listing stays in the space manager (R-SPACES-7): Manage → is the
// only action, and Home never opens a space's files (it holds no mount for
// them). The read happens once, on mount, right here — no polling.

export default function Spaces({ layout }: { layout: 'list' | 'strip' }) {
  const [raw, setRaw] = useState<SpaceInfo[] | SpacesRefusal>();

  useEffect(() => {
    let alive = true;
    readSpaces().then(
      (spaces) => {
        if (alive) setRaw(spaces);
      },
      (err: SpacesRefusal) => {
        if (alive) setRaw(err);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  if (raw === undefined) return null;
  const state: SpacesState = spacesState(raw);

  // The header links ride the heading on the desktop layouts (artboards 1a
  // and 1d draw them; the phone 1e heading carries none). Both links target
  // the same path on purpose: the manager renders its create entry whenever
  // it is full-tab with no create-intent parameter (verified 2026-09-04), so
  // there is no `?create=1` for a second link to spell. `?space=<id>`
  // selects the space only for an owner; for a writer or reader the link
  // still lands in the manager, on its list — accepted, not worked around.
  const links =
    layout === 'list' ? (
      <>
        <PlatformLink path={spacesRoute()}>All spaces →</PlatformLink>
        <PlatformLink path={spacesRoute()}>Create a space →</PlatformLink>
      </>
    ) : undefined;

  if (state.kind === 'empty') {
    return (
      <section className="sp" aria-label="Your spaces">
        <SectionHeading tag="/SPACES" title="Your spaces.">
          {links}
        </SectionHeading>
        <div className="sp-empty-box">
          <p className="sp-empty">
            You are not in any space yet. Create one, or wait for an invitation to reach your
            notifications.
          </p>
          <PlatformLink path={spacesRoute()} className="sp-empty__create">
            Create a space →
          </PlatformLink>
        </div>
      </section>
    );
  }

  if (state.kind === 'off') {
    return (
      <section className="sp" aria-label="Your spaces">
        <p className="sp-off">
          This version of Home cannot list your spaces.
          <PlatformLink path={spacesRoute()} className="sp-off__all">
            All spaces →
          </PlatformLink>
        </p>
      </section>
    );
  }

  return (
    <section className="sp" aria-label="Your spaces">
      <SectionHeading tag="/SPACES" title="Your spaces.">
        {links}
      </SectionHeading>
      <div className={layout === 'strip' ? 'sp-strip' : 'sp-list'}>
        {state.rows.map((row) => (
          <SpaceRow key={row.spaceId} row={row} layout={layout} />
        ))}
      </div>
    </section>
  );
}
