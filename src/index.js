import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import CustomElement from '@/components/CustomElement';
import { makeDataStore } from '@/hook';

makeDataStore('globalData', { item: 'jjj' });

const n = '3';

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

window.vDom = vDom;

render(vDom, document.getElementById('root'));
