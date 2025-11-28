import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { Mainbody } from '@/components/mainbody';
import { assignSharedStore, normalizePath } from '@/store';

export const Main = mount(renew => {
  const sharedStore = assignSharedStore(renew);

  const backgroundClass = computed(() => {
    const [, base, type] = normalizePath(sharedStore.path).split('/');

    const isTypePage =
      base === 'main' &&
      type &&
      !['install', 'examples', 'about'].includes(type);

    return isTypePage
      ? `bg-pokemon-${type}`
      : 'bg-linear-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-violet-500 to-blue-500';
  });

  return () => (
    <div
      class={`min-h-screen text-white transition-colors duration-300 ${backgroundClass.v}`}
    >
      <Mainbody />
    </div>
  );
});
