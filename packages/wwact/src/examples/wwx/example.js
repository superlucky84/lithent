import { h, Fragment } from '@/wDom';
import { render } from '@/render';
// import CustomElement from '@/examples/jsx/components/CustomElement';
// import NestedFragment from '@/examples/components/NestedFragment';
// import LoopTest from '@/examples/components/LoopTest';
// import Presentation from '@/examples/components/Presentation';
import test from '@/examples/wwx/test.wwx';
import storeInit from '@/store';

storeInit();

// const vDom = <NestedFragment />;
// const vDom = <LoopTest />;
// const vDom = <Presentation />;

// @ts-ignore
window.vDom = test;

render(test, document.getElementById('root'));
