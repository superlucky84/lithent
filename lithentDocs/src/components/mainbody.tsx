import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { Examples } from '@/pages/examples';
import { About } from '@/pages/about';
import { appStore } from '@/store';

export const Mainbody = mount(renew => {
  const store = appStore.watch(renew);
  let hashState = location.hash;
  window.addEventListener('hashchange', () => {
    hashState = location.hash;
    store.sidebarOpen = false;
    store.route = hashState;
    window.scrollTo(0, 0);
  });
  const matchHash = computed<string>(() => {
    if ('#examples' === hashState) {
      return <Examples />;
    } else if ('#install' === hashState) {
      return <Install />;
    } else if ('#about' === hashState) {
      return <About />;
    }
    return <Guide />;
  });

  return () => <main class="h-full">{matchHash.v}</main>;
});
