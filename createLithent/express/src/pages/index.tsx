import { h, mount } from 'lithent';
import { navigate } from '@/base/route';
import { getPreloadData } from '@/base/data';
import { fetchTypeList } from '@/helper/request';
import { TYPE_DESCRIPT } from '@/helper/constants';

export const preload = async () => {
  const data = await fetchTypeList();

  return { layout: { title: 'EXPRESS-LITHENT' }, data };
};

const Index = mount(() => {
  const preload = getPreloadData<{ data: { name: string; url: string }[] }>();

  const moveTypePage = (event: Event, name: string) => {
    event.preventDefault();
    navigate(`/${name}`);
  };

  console.log('DATA', preload);

  return () => (
    <div class="container px-8 mx-auto xl:px-5  max-w-screen-lg py-5 lg:py-8">
      <div class="mt-10 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3 ">
        {preload.data.map(({ name }) => (
          <div class="group cursor-pointer">
            <div class="overflow-hidden rounded-[40px] bg-gray-100 transition-all hover:scale-105 dark:bg-gray-800">
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
                  class="object-cover transition-all"
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
                      class={`bg-pokemon-${name} inline-block text-sm font-bold tracking-wider uppercase mt-5 text-white px-2 py-1 rounded drop-shadow-md outline-2 outline-black outline-offset-1`}
                    >
                      {name}
                    </span>
                  </a>
                </div>
                <h2 class="text-lg font-semibold leading-snug tracking-tight mt-2    dark:text-white">
                  <a
                    href="#"
                    onClick={(event: Event) => moveTypePage(event, name)}
                  >
                    <span class="bg-gradient-to-r from-red-200 to-blue-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]">
                      {TYPE_DESCRIPT[name]}
                    </span>
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

export default Index;
