import { h, Fragment, render } from 'wwact';
import Wwveal from '@/Wwveal';

const vDom = (
  <Fragment>
    <Wwveal />
  </Fragment>
);

// @ts-ignore
window.vDom = vDom;

render(vDom, document.getElementById('root'));
