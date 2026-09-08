import { PlatformLink } from '@immediately-run/sdk/platformLink';
import { FRONT_DOOR, HOME_EDIT, HOME_SOURCE } from '../lib/routes';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="foot">
      <span className="foot__note">Home is an app you can fork.</span>
      <a href={HOME_SOURCE} target="_blank" rel="noreferrer">view source</a>
      <PlatformLink path={HOME_EDIT}>fork this page →</PlatformLink>
      <PlatformLink className="foot__door" path={FRONT_DOOR}>Front door →</PlatformLink>
    </footer>
  );
}
