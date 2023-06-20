import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import { Example1 } from '@/components/examples/example1';
import { Example2 } from '@/components/examples/example2';
import { Example3 } from '@/components/examples/example3';
import { Example4 } from '@/components/examples/example4';
import { Example5 } from '@/components/examples/example5';
import { Example6 } from '@/components/examples/example6';
import { Example7 } from '@/components/examples/example7';
import { Example8 } from '@/components/examples/example8';
import { Example9 } from '@/components/examples/example9';
import { Example10 } from '@/components/examples/example10';
import { Example11 } from '@/components/examples/example11';

export const Examples = mount(() => {
  return () => (
    <div class="grid grid-cols-1 xl:grid-cols-2 px-4 pt-6 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="Examples" />

      {/*<!-- Right Content --> */}
      <Example1 />
      <Example2 />
      <Example3 />
      <Example4 />
      <Example5 />
      <Example6 />
      <Example7 />
      <Example8 />
      <Example9 />
      <Example10 />
      <Example11 />
    </div>
  );
});