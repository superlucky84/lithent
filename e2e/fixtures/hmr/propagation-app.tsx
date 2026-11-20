import { render } from 'lithent';
import { Greeting } from './Greeting';

// An entry without components, like a template's src/index.tsx: an edit
// here reloads the page.
const entry = 'original entry';
render(<Greeting entry={entry} />, document.getElementById('app')!);
