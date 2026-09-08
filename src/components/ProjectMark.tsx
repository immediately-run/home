import type { CSSProperties } from 'react';
import type { RecentProject } from '@immediately-run/sdk';
import { recentsHue } from '../lib/recents';

// The featured card's decorative panel — derived, never fetched. A 45° hatch
// over a radial wash whose hue is a deterministic hash of the repository
// coordinates, with the repository name as a chip in the corner. Home holds
// no capability that could fetch a screenshot or a favicon, and a launcher
// making a third-party request is what the sandbox exists to prevent. The
// one inline style here is the hue custom property.

export default function ProjectMark({ project }: { project: RecentProject }) {
  return (
    <div className="rec-mark" style={{ '--rec-hue': recentsHue(project) } as CSSProperties}>
      <span className="rec-mark__chip">{project.repository}</span>
    </div>
  );
}
