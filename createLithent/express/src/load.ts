import { h } from '@/engine';
import type { Props, TagFunction } from '@/engine';
import Layout from '@/layout';
import { hydration } from '@/engine/ssr';
const pageModules = import.meta.glob('./pages/*.tsx');
import { makeRoute } from '@/route';

export default async function load(key: string, props: Props) {
  const res = await pageModules[`./pages/${key}`]();
  const routeRef = makeRoute();

  routeRef.page = location.pathname;
  hydration(
    // @ts-ignore
    h(Layout, {}, h(res!.default as TagFunction, Object.assign(props))),
    document.documentElement
  );
}
