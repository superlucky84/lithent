import { h, Fragment } from '@/wDom';
import { makeData } from '@/hook';
import { render } from '@/render';
import CustomElement from '@/components/CustomElement';
import Custom2 from '@/components/Custom2';
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

console.log('VDOM = ', vDom);

render(vDom, document.getElementById('root'));
