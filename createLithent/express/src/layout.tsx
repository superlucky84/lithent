import type { TagFunction } from 'lithent';
import { h, mount } from 'lithent';
import LoadingText from '@/components/Loading';
import { getPreloadData } from '@/helper';
import clsx from '@/helper/clsx';
import { routeAssign } from '@/route';
import '@/main.css';

const Layout = mount<{
  page: TagFunction;
  params: Record<string, string>;
  query: Record<string, string>;
}>(r => {
  const preload = getPreloadData<{ layout: { title: string } }>();
  const routeRef = routeAssign(r, s => [s.loading]);

  return ({ page: Page, params, query }) => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{preload?.layout?.title || ''}</title>
      </head>
      <body
        class={clsx(
          params.type ? `bg-pokemon-${params.type}` : 'bg-gray-100',
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
