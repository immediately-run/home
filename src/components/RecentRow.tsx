import { PlatformLink } from '@immediately-run/sdk/platformLink';
import type { RecentProject } from '@immediately-run/sdk';
import { relativeOpened } from '../lib/recents';
import { editRoute, presentRoute } from '../lib/routes';

// One quiet row of the backlog list — hairline-separated by the shared
// container, never bordered on its own. The phone row carries Open only
// (1e); the row is not the place to discover editing.

export default function RecentRow({
  project,
  now,
  mobile,
}: {
  project: RecentProject;
  now: number;
  mobile: boolean;
}) {
  return (
    <div className="rec-row">
      <span className="rec-row__name">
        {project.namespace}/{project.repository}
      </span>
      <span className="rec-chip rec-chip--sm">{project.ref}</span>
      <span className="rec-row__opened">{relativeOpened(project.ts, now)}</span>
      <span className="rec-row__actions">
        <PlatformLink path={presentRoute(project)} className="rec-pill">
          Open
        </PlatformLink>
        {!mobile && (
          <PlatformLink path={editRoute(project)} className="rec-pill rec-pill--quiet">
            Edit
          </PlatformLink>
        )}
      </span>
    </div>
  );
}
