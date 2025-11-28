import { mount } from 'lithent';
import { state } from 'lithent/helper';
import { fetchTypeList } from '@/helper/request';
import { TYPE_DESCRIPT } from '@/helper/constants';
import { assignSharedStore, setPath } from '@/store';

type TypeItem = { name: string; url: string };

export const PokemonMain = mount(renew => {
  const types = state<TypeItem[]>([], renew);
  const loading = state(true, renew);
  const sharedStore = assignSharedStore(renew);

  const loadTypes = async () => {
    try {
      loading.value = true;
      const data = await fetchTypeList();
      types.value = data;
    } catch (err) {
      console.error('Failed to load Pokemon types', err);
      types.value = [];
    } finally {
      loading.value = false;
    }
  };

  if (types.value.length === 0) {
    loadTypes();
  }

  const moveTypePage = (event: Event, name: string) => {
    event.preventDefault();
    setPath(sharedStore, `/main/${name}`, { push: true });
  };

  return () => (
    <div class="container px-8 mx-auto xl:px-5 max-w-(--breakpoint-lg) py-5 lg:py-8">
      <h1 class="text-2xl font-bold text-white mb-6">Pokemon Types</h1>
      {loading.value ? (
        <div class="text-gray-300">Loading...</div>
      ) : (
        <div class="mt-10 grid gap-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:gap-10 xl:grid-cols-3 ">
          {types.value.map(({ name }) => (
            <div class="group cursor-pointer">
              <div class="overflow-hidden rounded-[40px] bg-gray-100 transition-all hover:scale-105">
                <a
                  class="relative block aspect-square"
                  href="#"
                  onClick={(event: Event) => moveTypePage(event, name)}
                >
                  <img
                    alt="Thumbnail"
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    class="object-cover transition-all group-hover:scale-105"
                    style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"
                    sizes="(max-width: 768px) 30vw, 33vw"
                    src={`/assets/${name}.svg`}
                  />
                </a>
              </div>
              <div>
                <div>
                  <div class="flex gap-3">
                    <a
                      href="#"
                      onClick={(event: Event) => moveTypePage(event, name)}
                    >
                      <span
                        class={`bg-pokemon-${name} inline-block text-sm font-bold tracking-wider uppercase mt-5 text-white px-2 py-1 rounded-sm drop-shadow-md`}
                      >
                        {name}
                      </span>
                    </a>
                  </div>
                  <h2 class="text-lg font-semibold leading-snug tracking-tight mt-2 text-gray-800 font-bold ">
                    <a
                      href="#"
                      onClick={(event: Event) => moveTypePage(event, name)}
                    >
                      <span class="bg-linear-to-r from-red-200 to-blue-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]">
                        {TYPE_DESCRIPT[name]}
                      </span>
                    </a>
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
