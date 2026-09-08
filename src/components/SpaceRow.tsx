import { PlatformLink } from '@immediately-run/sdk/platformLink';
import type { SpaceRow as SpaceRowData } from '../lib/spaces';
import { spacesRoute } from '../lib/routes';

// One space, two layouts of the same content — a bordered list row on the
// desktop, a card in the phone's horizontal strip. One component, one class
// set; the section's `layout` prop decides, and the stylesheet arranges.

export default function SpaceRow({ row, layout }: { row: SpaceRowData; layout: 'list' | 'strip' }) {
  return (
    <div className={layout === 'strip' ? 'sp-card' : 'sp-row'}>
      <span className="sp-name">{row.name}</span>
      {row.role && <span className="sp-role">{row.role}</span>}
      <PlatformLink path={spacesRoute(row.spaceId)} className="sp-manage">
        Manage →
      </PlatformLink>
    </div>
  );
}
