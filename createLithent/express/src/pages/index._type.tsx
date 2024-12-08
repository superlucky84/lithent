import { h, mount } from 'lithent';
import { state } from 'lithent/helper';
import { getPreloadData } from '@/base/data';
import { navigate } from '@/base/route';
import { fetchMonsterListByType } from '@/helper/request';

import type { PageProps } from '@/base/types';
import type { Info } from '@/helper/request';

type DataItem = { name: string; info: Info; infoString: string };

export const preload = async ({ params }: PageProps) => {
  const data = await fetchMonsterListByType(params.type);

  return {
    layout: {
      title: params.type,
    },
    data,
  };
};

function shuffleArray(array: DataItem[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
}

const Main = mount<PageProps>((r, { params: { type } }) => {
  const preload = getPreloadData<{
    data: { name: string; info: Info; infoString: string }[];
  }>();
  const data = state<DataItem[]>(preload.data, r);

  const moveDetail = (event: Event, name: string) => {
    event.preventDefault();
    navigate(`/${type}/${name}`);
  };

  const shuffle = () => {
    data.value = shuffleArray(data.value);
  };

  return () => (
    <div class="bg-pokemon-${params.type} container px-8 mx-auto xl:px-5 max-w-screen-lg py-5 lg:py-8">
      <button
        type="button"
        onClick={shuffle}
        class="bg-inherit text-gray-800 text-sm px-4 py-2 rounded shadow-md hover:shadow-lg transition-shadow"
      >
        Shuffle
      </button>
      <div class="mt-10 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3 ">
        {data.value.map(({ name, info, infoString }) => (
          <div class="group cursor-pointer">
            <div class="overflow-hidden rounded-md bg-gray-100 p-2 transition-all hover:scale-105">
              <a
                class="relative block aspect-square"
                href="#"
                onClick={(event: Event) => moveDetail(event, name)}
              >
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
              </a>
            </div>
            <div>
              <div>
                <div class="flex gap-3">
                  <a
                    href="#"
                    onClick={(event: Event) => moveDetail(event, name)}
                  >
                    <span class="inline-block text-xl font-medium tracking-wider uppercase mt-5 text-white">
                      {name}
                    </span>
                  </a>
                </div>
                <h2 class="text-sm leading-snug tracking-tight mt-2 text-gray-800 ">
                  <a
                    href="#"
                    onClick={(event: Event) => moveDetail(event, name)}
                  >
                    <span
                      class="whitespace-pre-wrap font-mono break-words overflow-auto bg-gradient-to-r from-red-200 to-blue-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]"
                      innerHTML={infoString}
                    />
                  </a>
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Main;
