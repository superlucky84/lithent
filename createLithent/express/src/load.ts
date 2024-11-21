import { h } from 'lithent';
import type { Props, TagFunction } from 'lithent';
import { hydration } from 'lithent/ssr';
const pageModules = import.meta.glob('./pages/*.tsx');
import { makeRoute } from '@/route';

console.log('PAGEMODULES', pageModules);

export default async function load(key: string, props: Props) {
  const res = await pageModules[`./pages/${key}`]();
  const routeRef = makeRoute();

  routeRef.page = location.pathname;
  routeRef.destroy = hydration(
    // @ts-ignore
    h(res!.default as TagFunction, Object.assign(props)),
    document.documentElement
  );
}
