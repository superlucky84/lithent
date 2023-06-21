import { h, mount } from 'lithent';
import { state, computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { Examples } from '@/pages/examples';
import { About } from '@/pages/about';
import { assignSharedStore } from '@/store';

export const Mainbody = mount(r => {
  const shardStore = assignSharedStore(r);
  const hashState = state<string>(location.hash, r);
  window.addEventListener('hashchange', () => {
    hashState.v = location.hash;
    shardStore.showHiddenMenu = false;
    window.scrollTo(0, 0);
  });
  const matchHash = computed<string>(() => {
    if ('#examples' === hashState.v) {
      return <Examples />;
    } else if ('#install' === hashState.v) {
      return <Install />;
    } else if ('#about' === hashState.v) {
      return <About />;
    }
    return <Guide />;
  });

  return () => <main class="h-full">{matchHash.v}</main>;
});
