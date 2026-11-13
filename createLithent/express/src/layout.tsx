import type { TagFunction } from 'lithent';
import { mount, mountCallback } from 'lithent';
import { computed } from 'lithent/helper';
import LoadingText from '@/components/Loading';
import { Header } from '@/components/Header';
import { getPreloadData } from '@/base/data';
import { routeWatch } from '@/base/routeStore';
import { loadFavorites } from '@/favorites';
import '@/main.css';

const Layout = mount<{
  page: TagFunction;
  params: Record<string, string>;
  query: Record<string, string>;
}>(r => {
  const title = computed(() => {
    const pageTitle = getPreloadData<{ layout?: { title: string } }>()?.layout
      ?.title;

    return pageTitle ? `${pageTitle} · Lithent App` : 'Lithent App';
  });
  const routeRef = routeWatch(r);

  // Runs in the browser only, after hydration: the server has no storage.
  mountCallback(() => {
    loadFavorites();
  });

  return ({ page: Page, params, query }) => (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title.value}</title>
      </head>
      <body class="min-h-screen bg-stone-50 text-stone-900">
        <Header />
        <main class="mx-auto max-w-5xl px-4 py-8">
          {routeRef.loading.value ? (
            <LoadingText />
          ) : (
            // Keyed by address: each page starts with fresh state and
            // preload data instead of reusing the previous page's.
            [
              <div key={routeRef.page.value}>
                <Page params={params} query={query} />
              </div>,
            ]
          )}
        </main>
      </body>
    </html>
  );
});

export default Layout;
