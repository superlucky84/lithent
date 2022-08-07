import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import CustomElement from '@/examples/components/CustomElement';
// import NestedFragment from '@/examples/components/NestedFragment';
// import LoopTest from '@/examples/components/LoopTest';
// import Presentation from '@/examples/components/Presentation';
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
