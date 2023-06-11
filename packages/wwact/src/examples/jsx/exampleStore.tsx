import { h, Fragment, render, wwact } from 'wwact';
import CustomElement from '@/examples/jsx/components/CustomElement';
import storeInit from '@/examples/jsx/store';

storeInit();

const MakeVDom = wwact(() => () => (
  <Fragment>
    <CustomElement vava={7} />
    <Fragment>
      <div>3</div>
      <div>3</div>
    </Fragment>
  </Fragment>
));
const root = <MakeVDom />;

//@ts-ignore
window.root = root;

render(root, document.getElementById('root'));
