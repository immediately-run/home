import '../styles/skeleton.css';

/** The auth-resolving state: the greeting row and four row placeholders,
 *  and nothing else — no sign-in prompt, no flash. */
export default function Skeleton() {
  return (
    <div className="skel">
      <div className="skel__greet">
        <div className="skel__title" />
        <div className="skel__actions">
          <div className="skel__pill skel__pill--a" />
          <div className="skel__pill skel__pill--b" />
        </div>
      </div>
      <div className="skel__rows">
        <div className="skel__eyebrow" />
        <div className="skel__feat" />
        <div className="skel__row" />
        <div className="skel__row" />
      </div>
    </div>
  );
}
