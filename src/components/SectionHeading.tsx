import type { ReactNode } from 'react';
import '../styles/section-heading.css';

export default function SectionHeading({ tag, title, children }: { tag: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      {children !== undefined && children !== null ? <div className="section-head__links">{children}</div> : null}
    </div>
  );
}
