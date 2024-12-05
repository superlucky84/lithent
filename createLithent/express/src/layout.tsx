import type { TagFunction } from 'lithent';
import { h, mount } from 'lithent';
import { computed } from 'lithent/helper';
import LoadingText from '@/components/Loading';
import { getPreloadData } from '@/base/data';
import clsx from '@/helper/clsx';
import { routeWatch } from '@/base/route';
import '@/main.css';

const Layout = mount<{
  page: TagFunction;
  params: Record<string, string>;
  query: Record<string, string>;
}>(r => {
  const preload = computed(
    () => getPreloadData<{ layout: { title: string } }>()?.layout
  );
  const routeRef = routeWatch(r, s => [s.loading]);

  return ({ page: Page, params, query }) => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{preload.value?.title || 'unknown'}</title>
      </head>
      <body
        class={clsx(
          params?.type
            ? `bg-pokemon-${params.type}`
            : 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-violet-500 to-blue-500',
          'flex items-center justify-center min-h-screen'
        )}
      >
        <div class="flex">
          {routeRef.loading ? (
            <LoadingText />
          ) : (
            <Page params={params} query={query} />
          )}
        </div>
      </body>
    </html>
  );
});

export default Layout;
