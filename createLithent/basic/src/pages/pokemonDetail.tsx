import { mount } from 'lithent';
import { state } from 'lithent/helper';
import { fetchPokemonInfo } from '@/helper/request';

type Props = { name: string };

export const PokemonDetail = mount<Props>((renew, { name }) => {
  const detail = state<{ img: string; infoString: string; title: string }>(
    { img: '', infoString: '', title: name },
    renew
  );
  const loading = state(true, renew);

  const loadDetail = async (target: string) => {
    try {
      loading.value = true;
      const data = await fetchPokemonInfo(target);
      detail.value = {
        img: data.info.img,
        infoString: data.infoString,
        title: data.info.name,
      };
    } catch (err) {
      console.error('Failed to load Pokemon detail', err);
      detail.value = { img: '', infoString: 'Failed to load', title: target };
    } finally {
      loading.value = false;
    }
  };

  loadDetail(name);

  return () => (
    <div class="container px-8 mx-auto xl:px-5 max-w-xl py-5 lg:py-8">
      <h2 class="text-2xl font-bold text-white capitalize mb-4 text-center">
        {detail.value.title}
      </h2>
      {loading.value ? (
        <div class="flex items-center gap-3 text-gray-900 mt-8 bg-white/80 rounded-lg px-4 py-3 shadow-lg backdrop-blur">
          <div class="h-10 w-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
          <div class="flex flex-col">
            <span class="text-lg font-semibold">Loading {name}...</span>
            <span class="text-sm text-gray-700">Fetching Pokémon data.</span>
          </div>
        </div>
      ) : (
        <div class="group cursor-pointer space-y-4">
          <div class="overflow-hidden rounded-md bg-white/90 p-4 transition-all hover:scale-105 shadow-lg">
            <div class="relative block aspect-square">
              <img
                alt="Thumbnail"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                class="object-contain transition-all"
                style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"
                sizes="(max-width: 768px) 30vw, 33vw"
                src={detail.value.img}
              />
            </div>
          </div>
          <div class="mt-4 bg-black/40 backdrop-blur-sm rounded-md p-3 shadow-lg">
            <h3 class="text-xl font-semibold text-white drop-shadow mb-2 capitalize">
              {detail.value.title}
            </h3>
            <p class="text-sm leading-snug tracking-tight text-white/90">
              <span
                class="whitespace-pre-wrap font-mono break-words overflow-auto block"
                innerHTML={detail.value.infoString}
              />
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
