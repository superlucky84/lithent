import { store } from 'lithent/helper';

/**
 * A minimal History API router. Components subscribe with `routeStore(renew)`
 * and re-render when `path` changes.
 */
export const routeStore = store<{ path: string }>({
  path: location.pathname,
});

const route = routeStore();

export type Route =
  | { name: 'home' }
  | { name: 'category'; category: string }
  | { name: 'recipe'; category: string; recipe: string }
  | { name: 'notfound' };

export function matchRoute(path: string): Route {
  const [category, recipe, ...rest] = path.split('/').filter(Boolean);

  if (!category) return { name: 'home' };
  if (rest.length > 0) return { name: 'notfound' };
  if (recipe) return { name: 'recipe', category, recipe };
  return { name: 'category', category };
}

export function navigate(to: string) {
  if (to !== location.pathname) {
    history.pushState(null, '', to);
  }
  route.path = to;
  window.scrollTo(0, 0);
}

/** Keeps `path` in sync with the back and forward buttons. */
export function syncWithHistory() {
  const onPopState = () => {
    route.path = location.pathname;
  };

  window.addEventListener('popstate', onPopState);
  return () => window.removeEventListener('popstate', onPopState);
}
