import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { Examples } from '@/pages/examples';
import { About } from '@/pages/about';
import { appStore } from '@/store';

export const Mainbody = mount(renew => {
  const store = appStore.watch(renew);

  window.addEventListener('popstate', () => {
    store.sidebarOpen = false;
    store.route = location.pathname;
    window.scrollTo(0, 0);
  });

  const matchPath = computed<string>(() => {
    if ('/examples' === store.route) {
      return <Examples />;
    } else if ('/install' === store.route) {
      return <Install />;
    } else if ('/about' === store.route) {
      return <About />;
    }
    return <Guide />;
  });

  return () => <main class="h-full">{matchPath.v}</main>;
});
