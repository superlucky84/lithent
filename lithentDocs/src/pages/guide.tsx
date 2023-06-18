import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import { Lesson1 } from '@/components/lesson/lesson1';
import { Lesson2 } from '@/components/lesson/lesson2';
import { Lesson3 } from '@/components/lesson/lesson3';
import { Lesson4 } from '@/components/lesson/lesson4';
import { Lesson5 } from '@/components/lesson/lesson5';
import { Lesson6 } from '@/components/lesson/lesson6';

// grid grid-cols-1 xl:grid-cols-2
export const Guide = mount(() => {
  return () => (
    <div class="max-w-3xl px-4 pt-6 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="Basic Guide" />

      <div class="mb-4 col-span-full xl:mb-2">
        <p class="text-gray-400">
          Lithent were developed to make it easy to insert VirtualDOM component
          fragments into pages already drawn with SSR, and are intended for
          lightweight, secondary use within other libraries.
        </p>
        <p class="mt-4 text-gray-400">
          After watching the six simple examples below, you should have an
          almost complete understanding of Lithent.
        </p>
      </div>

      {/*<!-- Right Content --> */}
      <Lesson1 />
      <Lesson2 />
      <Lesson3 />
      <Lesson4 />
      <Lesson5 />
      <Lesson6 />
    </div>
  );
});
