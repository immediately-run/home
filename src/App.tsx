import './index.css';
import './styles/app.css';
import { useEffect } from 'react';
import { useAuth, useFormFactor } from '@immediately-run/sdk';
import Footer from './components/Footer';
import Greeting from './components/Greeting';
import LinkTile from './components/LinkTile';
import Skeleton from './components/Skeleton';
import { primary } from './lib/primary';
import { NOTIFICATIONS, SETTINGS_LANGUAGE_MODEL } from './lib/routes';

export default function App() {
  const { status } = useAuth();
  const formFactor = useFormFactor();

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

  // The static half holds no recents and no omnibox, so the gradient primary
  // sits on the create door. The two data sections and the omnibox each feed
  // an input of this decision as they land.
  const primaryTarget = primary({ hasRecents: false, omniboxOpen: false });

  return (
    <div className={`page page--${formFactor.class}`}>
      <Greeting primary={primaryTarget} />
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
        />
      </div>
      <Footer />
    </div>
  );
}
