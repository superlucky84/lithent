import { h, mount } from 'lithent';
import { getPreloadData } from '@/base/data';
import { PageProps } from '@/base/types';
import { navigate } from '@/base/route';

export const preload = async ({ params }: any) => {
  const result = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.name}`)
    .then(response => response.json())
    .then(data => {
      return {
        id: data.id,
        name: data.name,
        types: data.types.map((typeInfo: any) => typeInfo.type.name),
        abilities: data.abilities.map(
          (abilityInfo: any) => abilityInfo.ability.name
        ),
        img:
          data.sprites.other.dream_world.front_default ||
          data.sprites.front_default,
        height: data.height,
        weight: data.weight,
      };
    });

  const data = result;

  return {
    layout: {
      title: params.name,
    },
    data,
  };
};

const Main = mount<PageProps<{ data: { name: string; img: string } }>>(() => {
  const info = getPreloadData<{ data: { name: string; img: string } }>().data;

  console.log(preload);

  return ({ params }) => (
    <div class={`container px-8 mx-auto xl:px-5  max-w-screen-lg py-5 lg:py-8`}>
      <div class="mt-10">
        <div class="group">
          <div
            class={`overflow-hidden rounded-md bg-gray-100 p-2 transition-all dark:bg-gray-800`}
          >
            <a
              class="relative block aspect-square"
              href="/post/14-architectural-design-ideas-for-spacious-interior"
              onClick={(event: Event) => {
                event.preventDefault();
                navigate(`/${params.type}/${info.name}`);
              }}
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
          <div class="">
            <div>
              <div class="flex gap-3">
                <a href="/category/design">
                  <span class="inline-block text-xs font-medium tracking-wider uppercase mt-5 text-blue-600">
                    {info.name}
                  </span>
                </a>
                <a href="/category/lifestyle">
                  <span class="inline-block text-xs font-medium tracking-wider uppercase   mt-5 text-purple-600">
                    Lifestyle
                  </span>
                </a>
              </div>
              <h2 class="text-lg font-semibold leading-snug tracking-tight mt-2    dark:text-white">
                <a href="/post/14-architectural-design-ideas-for-spacious-interior">
                  <span class="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 dark:from-purple-800 dark:to-purple-900">
                    1433 Architectural Design Ideas for a Spacious Interior
                  </span>
                </a>
              </h2>
              <div class="hidden">
                <p class="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                  <a href="/post/14-architectural-design-ideas-for-spacious-interior">
                    It is a cliche philosophical question, but it touches on
                    something fundamental about how humans relate to the world
                    around them.{' '}
                  </a>
                </p>
              </div>
              <div class="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <a href="/author/mario-sanchez">
                  <div class="flex items-center gap-3">
                    <div class="relative h-5 w-5 flex-shrink-0">
                      <img
                        alt="Mario Sanchez"
                        loading="lazy"
                        decoding="async"
                        data-nimg="fill"
                        class="rounded-full object-cover"
                        style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
                        sizes="20px"
                        src="/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fcijrdavx%2Fproduction%2F4a21e3f085ed310d00fbbd294eb2392cde7f9acc-3648x3648.jpg%3Fw%3D2000%26auto%3Dformat&amp;w=3840&amp;q=75"
                      />
                    </div>
                    <span class="truncate text-sm">Mario Sanchez</span>
                  </div>
                </a>
                <span class="text-xs text-gray-300 dark:text-gray-600">•</span>
                <time
                  class="truncate text-sm"
                  datetime="2022-10-21T06:05:00.000Z"
                >
                  October 21, 2022
                </time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Main;
