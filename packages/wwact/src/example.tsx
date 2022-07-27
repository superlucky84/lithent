import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import CustomElement from '@/components/CustomElement';
// import NestedFragment from '@/components/NestedFragment';
// import LoopTest from '@/components/LoopTest';
// import Presentation from '@/components/Presentation';
import storeInit from '@/store';

storeInit();

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

// const vDom = <NestedFragment />;
// const vDom = <LoopTest />;
// const vDom = <Presentation />;

// @ts-ignore
window.vDom = vDom;

render(vDom, document.getElementById('root'));
