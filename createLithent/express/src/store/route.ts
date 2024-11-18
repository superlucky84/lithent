import { render as lRender, h } from 'lithent';
import type { TagFunction } from 'lithent';
import { renderWithHydration } from 'lithent/ssr';
import { store } from 'lithent/helper';

/*
const pageMap: Record<string, string> = {
  '/': '@/pages/index',
  '/about': '@/pages/about',
  '/contact': '@/pages/contact',
};
*/

// @/pages 디렉터리 내의 모든 파일을 가져오는 glob 패턴
const modules = import.meta.glob('../pages/*.tsx');

function loadPage(dynamicPath: string) {
  const key = `../pages${dynamicPath === '/' ? '/index' : dynamicPath}.tsx`;
  if (modules[key]) {
    modules[key](); // 모듈을 비동기로 로드
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
      console.log(init, state.page);
      state.destroy();
      // render('', document.documentElement);
      // import(`@/pages${state.page === '/' ? '/index' : state.page}`).then(
      /*
      import(`@/pages/main`).then(res => {
        console.log('RES', res);
      });
      */

      loadPage(state.page);
    }
    console.log('7777');
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

  const destroy = lRender(h(tagFunction, {}), document.documentElement);

  routeRef.destroy = destroy;

  return destroy;
}
