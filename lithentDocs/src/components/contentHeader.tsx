import { h, mount } from 'lithent';

export const ContentHeader = mount<{ title: string }>((_nenew, { title }) => {
  return () => (
    <div class="mb-2 mt-2 col-span-full xl:mb-2">
      <h1 class="text-2xl font-semibold sm:text-3xl text-white">{title}</h1>
    </div>
  );
});
