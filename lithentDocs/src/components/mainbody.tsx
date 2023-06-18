import { h, mount } from 'lithent';
import { state, computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { assignSharedStore } from '@/store';

export const Mainbody = mount(r => {
  const shardStore = assignSharedStore(r);
  const hashState = state<string>(location.hash, r);
  window.addEventListener('hashchange', () => {
    hashState.v = location.hash;
    shardStore.showHiddenMenu = false;
  });
  const matchHash = computed<string>(() => {
    if ('#examples' === hashState.v) {
      return <div>examples</div>;
    } else if ('#install' === hashState.v) {
      return <Install />;
    }
    return <Guide />;
  });

  return () => <main>{matchHash.v}</main>;
});
