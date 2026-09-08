import './index.css';
import './styles/app.css';
import { useEffect, useState } from 'react';
// The record's one read site — exactly one caller per mount, so the grep for
// the platform call lands on a single line (import alias `readRecents`).
import { useAuth, useFormFactor, listRecentProjects as readRecents } from '@immediately-run/sdk';
import type { RecentProject } from '@immediately-run/sdk';
import Footer from './components/Footer';
import Greeting from './components/Greeting';
import LinkTile from './components/LinkTile';
import RecentProjects from './components/RecentProjects';
import Skeleton from './components/Skeleton';
import { recentsState } from './lib/recents';
import type { RecentRefusal, RecentsState } from './lib/recents';
import { primary } from './lib/primary';
import { NOTIFICATIONS, SETTINGS_LANGUAGE_MODEL } from './lib/routes';

// A read's outcome plus the clock reading it was taken against — labels are
// relative to the read, and the purity rule keeps Date.now() out of render.
interface RawRecents {
  projects: RecentProject[] | null | RecentRefusal;
  now: number;
}

export default function App() {
  const { status } = useAuth();
  const formFactor = useFormFactor();
  // The one read of the host-owned record, on mount — no polling, no
  // re-read on focus. The raw result (list, null, or the refusal's code)
  // goes into state and every decision about it runs through the pure
  // module during render, so a failure that is not `forbidden` reaches the
  // error boundary instead of masquerading as "recents are off".
  const [raw, setRaw] = useState<RawRecents>();

  useEffect(() => {
    let alive = true;
    const now = Date.now();
    readRecents().then(
      (projects) => {
        if (alive) setRaw({ projects, now });
      },
      (err: RecentRefusal) => {
        if (alive) setRaw({ projects: err, now });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  // A signed-out render is impossible by construction — the home mode is
  // signed-in only, and the host draws its own sign-in posture outside this
  // frame. Say it once and render nothing rather than inventing a prompt
  // (which would be imitating host chrome). The effect, not the render, owns
  // the log so it fires once per arrival at the state, not per re-render.
  useEffect(() => {
    if (status === 'signed-out') {
      console.warn('home: rendered signed out, which the home mode forbids — the host should have drawn its sign-in posture');
    }
  }, [status]);

  if (status === 'unknown') {
    return (
      <div className={`page page--${formFactor.class}`}>
        <Skeleton />
      </div>
    );
  }

  if (status === 'signed-out') {
    return null;
  }

  // The static half renders while the read is in flight; the featured
  // recent's Open becomes the gradient primary only once a list is on
  // screen, and falls back to the create door when the record is absent.
  const recents: RecentsState | undefined = raw === undefined ? undefined : recentsState(raw.projects);
  const primaryTarget = primary({ hasRecents: recents?.kind === 'list', omniboxOpen: false });
  const mobile = formFactor.class === 'mobile';

  return (
    <div className={`page page--${formFactor.class}`}>
      <Greeting primary={primaryTarget} />
      {recents !== undefined && raw !== undefined && (
        <RecentProjects
          state={recents}
          now={raw.now}
          primary={primaryTarget === 'recents'}
          mobile={mobile}
          onCleared={() => setRaw({ projects: null, now: Date.now() })}
        />
      )}
      <div className="tiles">
        <LinkTile
          tag="/MODEL"
          body="Connect a language model to use the built-in agent in any app."
          linkLabel="Language model settings →"
          to={SETTINGS_LANGUAGE_MODEL}
        />
        <LinkTile
          tag="/NEWS"
          title="Notifications"
          linkLabel="Open →"
          to={NOTIFICATIONS}
          linkToEnd
        />
      </div>
      <Footer />
    </div>
  );
}
