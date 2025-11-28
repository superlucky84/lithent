import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { Examples } from '@/pages/examples';
import { About } from '@/pages/about';
import { PokemonMain } from '@/pages/pokemon';
import { PokemonType } from '@/pages/pokemonType';
import { PokemonDetail } from '@/pages/pokemonDetail';
import { assignSharedStore, normalizePath, setPath } from '@/store';

export const Mainbody = mount(r => {
  const shardStore = assignSharedStore(r);

  const initial = normalizePath(
    location.pathname.startsWith('/main') ? location.pathname : '/main'
  );
  setPath(shardStore, initial, { replace: true, scroll: false });

  window.addEventListener('popstate', () => {
    setPath(shardStore, location.pathname, { scroll: true });
  });

  const matchRoute = computed(() => {
    const path = normalizePath(shardStore.path);
    const [, base, segment, detail] = path.split('/');

    if (base !== 'main') {
      return <Guide />;
    }

    if (!segment) {
      return <PokemonMain />;
    }

    if (segment && detail) {
      return <PokemonDetail name={detail} />;
    }

    switch (segment) {
      case 'install':
        return <Install />;
      case 'examples':
        return <Examples />;
      case 'about':
        return <About />;
      default:
        return <PokemonType type={segment} />;
    }
  });

  return () => <main class="h-full">{matchRoute.v}</main>;
});
