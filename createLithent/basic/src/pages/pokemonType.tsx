import { mount } from 'lithent';
import { state } from 'lithent/helper';
import { fetchMonsterListByType } from '@/helper/request';
import { shuffleArray } from '@/helper/calculator';
import { assignSharedStore, setPath } from '@/store';

type Props = { type: string; name?: string };

export const PokemonType = mount<Props>((renew, { type }) => {
  const monsters = state<
    { name: string; info: { img: string }; infoString: string }[]
  >([], renew);
  const loading = state(true, renew);
  const sharedStore = assignSharedStore(renew);

  const loadMonsters = async (target: string) => {
    try {
      loading.value = true;
      const data = await fetchMonsterListByType(target);
      monsters.value = data;
    } catch (err) {
      console.error('Failed to load Pokemon by type', err);
      monsters.value = [];
    } finally {
      loading.value = false;
    }
  };

  loadMonsters(type);

  const shuffle = () => {
    monsters.value = shuffleArray(monsters.value);
  };

  const goDetail = (event: Event, name: string) => {
    event.preventDefault();
    setPath(sharedStore, `/main/${type}/${name}`, { push: true });
  };

  return () => (
    <div
      class={`bg-pokemon-${type} container px-8 mx-auto xl:px-5 max-w-(--breakpoint-lg) py-5 lg:py-8`}
    >
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white capitalize">{type}</h2>
        <button
          type="button"
          onClick={shuffle}
          class="bg-white/80 text-gray-900 text-sm px-4 py-2 rounded-sm shadow-md hover:shadow-lg transition-shadow"
        >
          shuffle
        </button>
      </div>
      {loading.value ? (
        <div class="flex items-center gap-3 text-gray-900 mt-8 bg-white/80 rounded-lg px-4 py-3 shadow-lg backdrop-blur">
          <div class="h-10 w-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
          <div class="flex flex-col">
            <span class="text-lg font-semibold">Loading {type} type...</span>
            <span class="text-sm text-gray-700">
              Fetching Pokémon, please wait.
            </span>
          </div>
        </div>
      ) : (
        <div class="mt-10 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {monsters.value.map(({ name, info, infoString }) => (
            <div
              class="group cursor-pointer"
              onClick={(event: Event) => goDetail(event, name)}
            >
              <div class="overflow-hidden rounded-md bg-white/90 p-2 transition-all hover:scale-105 shadow-lg">
                <div class="relative block aspect-square">
                  <img
                    alt="Thumbnail"
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    class="object-contain transition-all"
                    style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"
                    sizes="(max-width: 768px) 30vw, 33vw"
                    src={info.img}
                  />
                </div>
              </div>
              <div class="mt-4 bg-black/40 backdrop-blur-sm rounded-md p-3 shadow-lg">
                <div class="flex gap-3 items-center">
                  <span class="inline-block text-xl font-semibold tracking-wider uppercase text-white drop-shadow">
                    {name}
                  </span>
                </div>
                <h2 class="text-sm leading-snug tracking-tight mt-2 text-white/90">
                  <span
                    class="whitespace-pre-wrap font-mono break-words overflow-auto block"
                    innerHTML={infoString}
                  />
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
