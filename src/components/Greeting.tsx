import { PlatformLink } from '@immediately-run/sdk/platformLink';
import type { PrimaryTarget } from '../lib/primary';
import { MAKE_AN_APP } from '../lib/routes';
import '../styles/greeting.css';

export default function Greeting({ primary }: { primary: PrimaryTarget }) {
  return (
    <header className="greeting">
      <h1 className="greeting__title">Welcome back.</h1>
      <div className="greeting__actions">
        {/* Opens the inline omnibox once that ships as a package; inert hairline until then. */}
        <button type="button" className="btn-ghost">Paste a repo</button>
        <PlatformLink path={MAKE_AN_APP} className={primary === 'create' ? 'btn' : 'btn-ghost'}>
          Make an app →
        </PlatformLink>
      </div>
    </header>
  );
}
