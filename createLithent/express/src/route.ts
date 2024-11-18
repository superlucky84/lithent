import { render as lRender, h } from 'lithent';
import type { TagFunction } from 'lithent';
import { renderWithHydration } from 'lithent/ssr';
import { store } from 'lithent/helper';

const modules = import.meta.glob('./pages/*.tsx');
const cacheRender = {} as any;

async function loadPage(dynamicPath: string) {
  const key = `./pages${dynamicPath === '/' ? '/index' : dynamicPath}.tsx`;
  if (cacheRender[key]) {
    cacheRender[key]();
  } else if (modules[key]) {
    const res = await import(key);
    // const kk = await modules[key](); // 모듈을 비동기로 로드
    cacheRender[key] = res.default;
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
  routeRef.page = location.pathname;
}

export function render(tagFunction: TagFunction) {
  if (init) {
    const destroy = renderWithHydration(tagFunction);

    routeRef.destroy = destroy;

    return destroy;
  }

  const rRender = () => lRender(h(tagFunction, {}), document.documentElement);
  const destroy = rRender();

  routeRef.destroy = destroy;

  return rRender;
}
