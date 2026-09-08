import type { Ref } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { PlatformLink } from '@immediately-run/sdk/platformLink';
import { Omnibox } from '@immediately-run/omnibox';
import type { PrimaryTarget } from '../lib/primary';
import { MAKE_AN_APP } from '../lib/routes';
import '../styles/greeting.css';

// The greeting row and, beneath it, the pasted-repo launcher. The open state
// lives in App (it is an input to the page's primary decision); this shell
// renders the row and the omnibox block from props. The omnibox is the front
// door's component, mounted once, launch grammar only — no `hits` prop, so
// the panel shows the location row and nothing else. Escape inside the block
// closes the block and returns focus to the Paste a repo link: the package's
// own handler clears and blurs its panel, and App's wrapper handler (one
// listener, not two doing the same job) closes and refocuses.

export default function Greeting({
  primary,
  omniboxOpen,
  onToggle,
  toggleRef,
  onOmniboxKeyDown,
}: {
  primary: PrimaryTarget;
  omniboxOpen: boolean;
  onToggle: () => void;
  toggleRef?: Ref<HTMLButtonElement>;
  onOmniboxKeyDown: (e: ReactKeyboardEvent) => void;
}) {
  return (
    <header className="greeting">
      <h1 className="greeting__title">Welcome back.</h1>
      <div className="greeting__actions">
        <button type="button" className="btn-ghost" onClick={onToggle} ref={toggleRef}>
          Paste a repo
        </button>
        <PlatformLink path={MAKE_AN_APP} className={primary === 'create' ? 'btn' : 'btn-ghost'}>
          Make an app →
        </PlatformLink>
      </div>
      {omniboxOpen && (
        <div className="greeting__paste" onKeyDown={onOmniboxKeyDown}>
          <Omnibox variant="hero" />
        </div>
      )}
    </header>
  );
}
