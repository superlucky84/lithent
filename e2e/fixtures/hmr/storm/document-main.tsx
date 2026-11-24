import { render } from 'lithent';
import { Layout } from './Layout';

// Like the SSR template's layout, the root renders the whole document and
// replaces the page's <html>. Keep the core marker the E2E server set on it.
const core = document.documentElement.dataset.core;
render(<Layout core={core} />, document.documentElement);
