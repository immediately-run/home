import { PlatformLink } from '@immediately-run/sdk/platformLink';
import type { RecentProject } from '@immediately-run/sdk';
import ProjectMark from './ProjectMark';
import { relativeOpened } from '../lib/recents';
import { editRoute, presentRoute } from '../lib/routes';

// The newest project — the arrival target. Open is the page's one gradient
// primary when `primary` (the page decides, never a class name); on the phone
// the decorative panel and the inline Edit go, Edit moving behind the ⋯ menu
// rather than rendering hidden (a hidden button is still a tab stop).

export default function FeaturedProject({
  project,
  now,
  primary,
  mobile,
}: {
  project: RecentProject;
  now: number;
  primary: boolean;
  mobile: boolean;
}) {
  return (
    <div className="rec-featured">
      <div className="rec-featured__text">
        <div>
          <div className="rec-featured__title">
            <span className="rec-featured__name">
              {project.namespace}/{project.repository}
            </span>
            <span className="rec-chip">{project.ref}</span>
          </div>
          <div className="rec-featured__opened">{relativeOpened(project.ts, now)}</div>
        </div>
        <div className="rec-featured__actions">
          <PlatformLink
            path={presentRoute(project)}
            className={primary ? 'btn rec-open' : 'btn-ghost rec-open'}
          >
            Open
          </PlatformLink>
          {mobile ? (
            <details className="rec-menu">
              <summary className="rec-menu__toggle" aria-label="More actions">
                ⋯
              </summary>
              <PlatformLink path={editRoute(project)} className="btn-ghost rec-menu__item">
                Edit
              </PlatformLink>
            </details>
          ) : (
            <PlatformLink path={editRoute(project)} className="btn-ghost rec-edit">
              Edit
            </PlatformLink>
          )}
        </div>
      </div>
      {!mobile && <ProjectMark project={project} />}
    </div>
  );
}
