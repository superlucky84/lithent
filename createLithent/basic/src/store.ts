import { store } from 'lithent/helper';

export const assignSharedStore = store<{
  showHiddenMenu: boolean;
  path: string;
}>({
  showHiddenMenu: false,
  path: location.pathname,
});

export function normalizePath(path: string) {
  const cleaned = path.replace(/\/+$/, '');
  return cleaned === '' ? '/main' : cleaned;
}

export function setPath(
  sharedStore: { showHiddenMenu: boolean; path: string },
  path: string,
  options: { push?: boolean; replace?: boolean; scroll?: boolean } = {}
) {
  const raw = path.startsWith('/main')
    ? path
    : `/main${path.startsWith('/') ? '' : '/'}${path}`;
  const target = normalizePath(raw);

  if (options.push && window.location.pathname !== target) {
    history.pushState(null, '', target);
  } else if (options.replace && window.location.pathname !== target) {
    history.replaceState(null, '', target);
  }

  sharedStore.showHiddenMenu = false;
  sharedStore.path = target;

  if (options.scroll !== false) {
    window.scrollTo(0, 0);
  }
}
