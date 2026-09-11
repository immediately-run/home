import { useState } from 'react';
import { clearRecentProjects } from '@immediately-run/sdk';
import FeaturedProject from './FeaturedProject';
import RecentRow from './RecentRow';
import SectionHeading from './SectionHeading';
import type { RecentsState } from '../lib/recents';
import '../styles/recents.css';

// The /RECENT section: it renders what a RecentsState decided and owns the
// clear flow. The read itself lives in App.tsx — exactly one caller per mount
// — and the page's primary moves with it, so a cleared record reports back
// through `onCleared` instead of hiding itself locally (the gradient then
// lands on the create door, which only the page can decide).

export default function RecentProjects({
  state,
  now,
  primary,
  mobile,
  onCleared,
}: {
  state: RecentsState;
  now: number;
  primary: boolean;
  mobile: boolean;
  onCleared: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearFailure, setClearFailure] = useState<string | null>(null);

  if (state.kind === 'absent') return null;

  const clear = async () => {
    setClearing(true);
    setClearFailure(null);
    try {
      await clearRecentProjects();
      onCleared();
    } catch (err) {
      // The record is host-owned; the truthful surface after a failed clear
      // is the one that is still there. Log loudly, stay on the list, and
      // name the typed reason for the user — the code, never the message.
      console.error('home: clearing recent projects failed', err);
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : 'unknown';
      setClearFailure(code);
      setConfirming(false);
    } finally {
      setClearing(false);
    }
  };

  if (state.kind === 'off') {
    return (
      <section className="rec" aria-label="Recent projects">
        <SectionHeading tag="/RECENT" title="Recent projects." />
        <p className="rec-off">Recents are off for this version of Home.</p>
      </section>
    );
  }

  return (
    <section className="rec" aria-label="Recent projects">
      <SectionHeading tag="/RECENT" title="Recent projects." />
      <FeaturedProject project={state.featured} now={now} primary={primary} mobile={mobile} />
      {state.rest.length > 0 && (
        <div className="rec-rows">
          {state.rest.map((project) => (
            <RecentRow
              key={`${project.namespace}/${project.repository}/${project.ref}`}
              project={project}
              now={now}
              mobile={mobile}
              dimmed={clearing}
            />
          ))}
        </div>
      )}
      {clearFailure !== null && (
        <p className="rec-clear__error" role="status">
          Could not clear your recent projects ({clearFailure}). Nothing was removed.
        </p>
      )}
      {confirming ? (
        <p className="rec-clear">
          Clear recent projects?{' '}
          <button type="button" className="rec-clear__btn" onClick={clear} disabled={clearing} aria-busy={clearing}>
            {clearing ? 'Clearing…' : 'Clear'}
          </button>{' '}
          <button type="button" className="rec-clear__btn" onClick={() => setConfirming(false)} disabled={clearing}>
            Keep
          </button>
        </p>
      ) : (
        <button type="button" className="rec-clear__line" onClick={() => setConfirming(true)}>
          Clear recent projects
        </button>
      )}
    </section>
  );
}
