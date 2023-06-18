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
