import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import CustomElement from '@/examples/jsx/components/CustomElement';
// import NestedFragment from '@/examples/jsx/components/NestedFragment';
// import LoopTest from '@/examples/jsx/components/LoopTest';
import storeInit from '@/examples/jsx/store';

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
