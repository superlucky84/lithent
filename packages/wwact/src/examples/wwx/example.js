import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import test from '@/examples/wwx/test.wwx';
import storeInit from '@/examples/wwx/store';

storeInit();

// const vDom = <NestedFragment />;
// const vDom = <LoopTest />;
// const vDom = <Presentation />;

// @ts-ignore
window.vDom = test;

render(test, document.getElementById('root'));
