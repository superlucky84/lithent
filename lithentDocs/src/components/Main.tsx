import { h, mount } from 'lithent';
import { Aside } from '@/components/aside';
import { Mainbody } from '@/components/mainbody';

export const Main = mount(() => {
  return () => (
    <div class="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Aside />
      <div
        class="fixed inset-0 z-10 hidden bg-gray-900/50 dark:bg-gray-900/90"
        id="sidebarBackdrop"
      ></div>
      <div
        id="main-content"
        class="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900"
      >
        <Mainbody />
      </div>
    </div>
  );
});
