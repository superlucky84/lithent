import { h, mount } from 'lithent';
import { getPreloadData } from '@/base/data';
import { fetchPokemonInfo } from '@/helper/request';

import type { PageProps } from '@/base/types';
import type { Info } from '@/helper/request';

export const preload = async ({ params }: PageProps) => {
  const data = await fetchPokemonInfo(params.name);

  return { layout: { title: params.name }, data };
};

const Main = mount<PageProps>(() => {
  const { info, infoString } = getPreloadData<{
    data: { info: Info; infoString: string };
  }>().data;

  return () => (
    <div class={`container px-8 mx-auto xl:px-5  max-w-screen-lg py-5 lg:py-8`}>
      <div class="mt-10 w-full">
        <div class="group">
          <div
            class={`overflow-hidden rounded-md bg-gray-100 p-2 transition-all hover:scale-105`}
          >
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
          <div class="">
            <div>
              <div class="flex gap-3">
                <span class="inline-block text-xl font-medium tracking-wider uppercase mt-5 text-gray-800">
                  {info.name}
                </span>
              </div>
              <h2 class="text-sm leading-snug tracking-tight mt-2 text-gray-800">
                <span
                  class="whitespace-pre-wrap font-mono break-words overflow-auto"
                  innerHTML={infoString}
                />
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Main;
