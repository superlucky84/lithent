import { h, Fragment, render, mount } from 'wwact';
import { Router, RouterItem } from '@/Router';
import Main from '@/components/Main';
import Sub from '@/components/Sub';
import Sub2 from '@/components/Sub2';

const Root = mount(function () {
  return () => (
    <Fragment>
      <Router>
        <RouterItem path="main" element={<Main />} />
        <RouterItem path="sub" element={<Sub />} />
        <RouterItem path=":sub" element={<Sub2 />} />
      </Router>
    </Fragment>
  );
});

render(<Root />, document.getElementById('root'));
