import { render as lRender, h } from 'lithent';
import type { TagFunction } from 'lithent';
import { renderWithHydration } from 'lithent/ssr';
import { store } from 'lithent/helper';

const pageModules = import.meta.glob('./pages/*.tsx');
const cacheRender: { [key: string]: () => void } = {};

function findPageModlueKey(pageModuleKeys: string[], key: string) {
  console.log('KEY', key);
  console.log('KEYSEGMENTLIST', key.split(/(?:\/|\.)/));

  console.log(pageModuleKeys);

  pageModuleKeys.find(item => {
    const moduleSegmentList = item.split(/(?:\/|\.)/);
    console.log('MODULESEGMENTLIST', moduleSegmentList);
  });
}

async function loadPage(dynamicPath: string) {
  const key = `./pages${dynamicPath === '/' ? '/index' : dynamicPath}.tsx`;
  findPageModlueKey(Object.keys(pageModules), key);

  if (cacheRender[key]) {
    cacheRender[key]();
  } else if (pageModules[key]) {
    const res = await pageModules[key]();
    //@ts-ignore
    const render = () => lRender(h(res.default), document.documentElement);
    render();
    cacheRender[key] = render;
  }
}

let init = true;
export const routeAssign = store<{
  page: string;
  destroy: (() => void) | string;
}>({
  page: '',
  destroy: '',
});

let prePage = '';
export const routeRef = routeAssign(
  state => {
    if (
      state &&
      state.page !== prePage &&
      typeof state.destroy === 'function'
    ) {
      init = false;
      state.destroy();

      loadPage(state.page);
    }
    prePage = state.page;
  },
  store => [store.page, store.destroy]
);

if (typeof window !== 'undefined') {
  //@ts-ignore
  window.routeRef = routeRef;
}

export function render(tagFunction: TagFunction) {
  if (init) {
    const destroy = renderWithHydration(tagFunction);

    routeRef.destroy = destroy;

    return typeof destroy === 'string'
      ? destroy
      : () => lRender(h(tagFunction, {}), document.documentElement);
  }

  const rRender = () => lRender(h(tagFunction, {}), document.documentElement);
  const destroy = rRender();

  routeRef.destroy = destroy;

  return rRender;
}
