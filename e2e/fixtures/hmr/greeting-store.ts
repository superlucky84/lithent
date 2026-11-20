import { store } from 'lithent/helper';

// A module without components, like a template's src/favorites.ts: an edit
// here reaches the page through the component that imports it.
export const greetingStore = store({ count: 0 });
export const label = 'original label';
