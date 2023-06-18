import { h, mount } from 'lithent';

export const ContentHeader = mount<{ title: string }>((_nenew, { title }) => {
  return () => (
    <div class="mb-4 col-span-full xl:mb-2">
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        {title}
      </h1>
    </div>
  );
});
