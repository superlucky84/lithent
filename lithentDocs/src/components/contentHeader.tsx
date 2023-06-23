import { h, mount, ref } from 'lithent';

export const ContentHeader = mount<{
  taregetRef?: { value: HTMLElement | null };
  title: string;
}>((_nenew, { title, taregetRef = ref(null) }) => {
  return () => (
    <div ref={taregetRef} class="mb-2 mt-2 col-span-full xl:mb-2">
      <h1 class="text-3xl font-semibold sm:text-4xl text-white">{title}</h1>
    </div>
  );
});
