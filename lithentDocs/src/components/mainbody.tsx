import { h, mount } from 'lithent';
import { Guide } from '@/pages/guide';

export const Mainbody = mount(() => {
  return () => (
    <main>
      <Guide />
    </main>
  );
});
