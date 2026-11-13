import { mount, mountCallback } from 'lithent';
import { Header } from '@/components/Header';
import { NotFound } from '@/components/NotFound';
import { Home } from '@/pages/Home';
import { Category } from '@/pages/Category';
import { RecipeDetail } from '@/pages/RecipeDetail';
import { loadFavorites } from '@/favorites';
import { matchRoute, routeStore, syncWithHistory } from '@/router';

export const App = mount(renew => {
  const route = routeStore(renew);

  mountCallback(() => {
    loadFavorites();
    // The returned cleanup runs when App unmounts.
    return syncWithHistory();
  });

  const renderPage = () => {
    const current = matchRoute(route.path);

    switch (current.name) {
      case 'home':
        return <Home />;
      case 'category':
        return <Category category={current.category} />;
      case 'recipe':
        return (
          <RecipeDetail category={current.category} recipe={current.recipe} />
        );
      default:
        return <NotFound />;
    }
  };

  return () => (
    <div class="min-h-screen bg-stone-50 text-stone-900">
      <Header />
      <main class="mx-auto max-w-5xl px-4 py-8">
        {/* Keyed by address: each page starts with fresh state (search
            text, servings) instead of reusing the previous page's. */}
        {[<div key={route.path}>{renderPage()}</div>]}
      </main>
    </div>
  );
});
