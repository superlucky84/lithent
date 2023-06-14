import { h, render, mount, Fragment } from 'lithent';
import { HeaderNav } from '@/components/headernav';
import { Main } from '@/components/Main';
import '@/input.css';

// https://github.com/themesberg/flowbite-admin-dashboard

const Root = mount(() => {
  return () => (
    <>
      <HeaderNav />
      <Main />
    </>
  );
});

render(<Root />, document.body);
/*
import { Router, RouterItem } from 'lithent-router';
import Main from '@/components/Main';
import Sub from '@/components/Sub';
import Sub2 from '@/components/Sub2';
<main>
  <Router>
    <RouterItem path="main" element={<Main />} />
    <RouterItem path="sub" element={<Sub />} />
    <RouterItem path=":sub" element={<Sub2 />} />
  </Router>
</main>
*/
