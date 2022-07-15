import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import CustomElement from '@/components/CustomElement';
import { Router, RouterItem } from '@/components/Router';
import Main from '@/components/Main';
import Sub from '@/components/Sub';
import Sub2 from '@/components/Sub2';
import NestedFragment from '@/components/NestedFragment';
import storeInit from '@/store';

storeInit();

/*
const vDom = (
  <Fragment>
    <CustomElement vava={7} />
    <CustomElement vava={7} />
    <Fragment>
      <div>3</div>
      <div>3</div>
    </Fragment>
  </Fragment>
);
*/

const vDom = (
  <Fragment>
    <Router>
      <RouterItem path="main" element={<Main />} />
      <RouterItem path="sub" element={<Sub />} />
      <RouterItem path=":sub" element={<Sub2 />} />
    </Router>
  </Fragment>
);

// const vDom = <NestedFragment />;

window.vDom = vDom;

render(vDom, document.getElementById('root'));
