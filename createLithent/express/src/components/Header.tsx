import { mount } from 'lithent';
import { Link } from '@/components/Link';
import { favoriteStore } from '@/favorites';

export const Header = mount(renew => {
  // Same store as the favorite button on the recipe page.
  const favorites = favoriteStore(renew);

  return () => (
    <header class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" class="text-lg font-bold">
          🍳 Lithent Recipes
        </Link>
        <span
          class="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900"
          title="Favorites are saved in this browser"
        >
          ★ {favorites.ids.length}{' '}
          {favorites.ids.length === 1 ? 'favorite' : 'favorites'}
        </span>
      </div>
    </header>
  );
});
