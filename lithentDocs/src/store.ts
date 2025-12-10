import { lstore } from 'lithent/helper';

const KO_PREFIX = '/ko';

const ensureLeadingSlash = (path: string) =>
  path.startsWith('/') ? path : `/${path}`;

const stripKoPrefix = (path: string) => {
  const normalized = ensureLeadingSlash(path || '/');
  const stripped = normalized.replace(/^\/ko(?=\/|$)/, '');
  return stripped || '/';
};

export const resolveRouteForLanguage = (path: string, lang: 'en' | 'ko') => {
  const base = stripKoPrefix(path);
  if (lang === 'ko') {
    return `${KO_PREFIX}${base}`;
  }

  return base;
};

// Get initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('lithent-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

// Global store using lstore
export const appStore = lstore<{
  theme: 'light' | 'dark';
  route: string;
  sidebarOpen: boolean;
}>({
  theme: getInitialTheme(),
  route: location.pathname || '/guide/introduction',
  sidebarOpen: false,
});

// Get store without subscription (for utility functions)
const store = appStore.watch();

// Apply theme to document
export const applyTheme = (theme: 'light' | 'dark') => {
  store.theme = theme;
  localStorage.setItem('lithent-theme', theme);

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Toggle theme
export const toggleTheme = () => {
  applyTheme(store.theme === 'light' ? 'dark' : 'light');
};

export const isKoreanRoute = () => store.route.startsWith(KO_PREFIX);

const navigateInternal = (path: string) => {
  store.route = path;
  window.history.pushState({}, '', path);
  store.sidebarOpen = false;
  window.scrollTo(0, 0);
};

// Navigate to route (language-aware)
export const navigateTo = (path: string) => {
  const lang: 'en' | 'ko' = isKoreanRoute() ? 'ko' : 'en';
  const target = resolveRouteForLanguage(path, lang);
  navigateInternal(target);
};

export const setLanguage = (lang: 'en' | 'ko') => {
  const target = resolveRouteForLanguage(store.route, lang);
  if (target !== store.route) {
    navigateInternal(target);
  }
};

export const toggleLanguage = () => {
  setLanguage(isKoreanRoute() ? 'en' : 'ko');
};

// Listen to popstate (browser back/forward)
window.addEventListener('popstate', () => {
  store.route = location.pathname || '/guide/introduction';
  window.scrollTo(0, 0);
});

// Initialize theme on load
applyTheme(store.theme);
