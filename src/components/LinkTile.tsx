import { PlatformLink } from '@immediately-run/sdk/platformLink';
import '../styles/tiles.css';

export interface LinkTileProps {
  /** The mono eyebrow, e.g. /MODEL. */
  tag: string;
  /** An optional display heading inside the tile. */
  title?: string;
  /** An optional body sentence inside the tile. */
  body?: string;
  /** The pill's label, e.g. "Language model settings →". */
  linkLabel: string;
  /** The platform path the pill navigates to. */
  to: string;
}

/** One bordered panel tile with its own eyebrow and one hairline link pill.
 *  Rendered twice — the /MODEL and /NEWS pair; a second tile markup is the
 *  copy defect this component exists to prevent. */
export default function LinkTile({ tag, title, body, linkLabel, to }: LinkTileProps) {
  return (
    <section className="tile">
      <span className="tag">{tag}</span>
      {title !== undefined ? <h3 className="tile__title">{title}</h3> : null}
      {body !== undefined ? <p className="tile__body">{body}</p> : null}
      <PlatformLink path={to} className="btn-ghost tile__link">{linkLabel}</PlatformLink>
    </section>
  );
}
