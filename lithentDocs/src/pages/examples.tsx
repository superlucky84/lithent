import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import { Example1 } from '@/components/examples/example1';
import { Example2 } from '@/components/examples/example2';

export const Examples = mount(() => {
  return () => (
    <div class="grid grid-cols-1 xl:grid-cols-2 px-4 pt-6 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="Examples" />

      {/*<!-- Right Content --> */}
      <Example1 />
      <Example2 />
    </div>
  );
});
