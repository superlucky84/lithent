import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import { Lesson1 } from '@/components/lesson/lesson1';
import { Lesson2 } from '@/components/lesson/lesson2';
import { Lesson3 } from '@/components/lesson/lesson3';
import { Lesson4 } from '@/components/lesson/lesson4';
import { Lesson5 } from '@/components/lesson/lesson5';
import { Lesson6 } from '@/components/lesson/lesson6';

export const Guide = mount(() => {
  return () => (
    <div class="grid grid-cols-1 px-4 pt-6 xl:grid-cols-2 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="가이드" />

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
