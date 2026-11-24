import { store } from 'lithent/helper';

/**
 * Favorites shared by every component that subscribes with
 * `favoriteStore(renew)`. Assigning a new `ids` array re-renders them all.
 */
export const favoriteStore = store<{ ids: string[] }>({ ids: [] });

const favorites = favoriteStore();
const STORAGE_KEY = 'lithent-app:favorites';

export function isFavorite(ids: string[], id: string) {
  return ids.includes(id);
}

export function toggleFavorite(id: string) {
  favorites.ids = isFavorite(favorites.ids, id)
    ? favorites.ids.filter(item => item !== id)
    : [...favorites.ids, id];
  saveFavorites();
}

/** Call after mount: the first render must match the server, which has no storage. */
export function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) {
      favorites.ids = saved.filter(item => typeof item === 'string');
    }
  } catch {
    // Storage can be unavailable (private mode) or hold invalid JSON.
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.ids));
  } catch {
    // Keep working in memory when storage is unavailable.
  }
}
