import { h, Fragment, render } from '@/index';
import CustomElement from '@/examples/jsx/components/CustomElement';
import storeInit from '@/examples/jsx/store';

storeInit();

const MakeVDom = () => () =>
  (
    <Fragment>
      <CustomElement vava={7} />
      <CustomElement vava={7} />
      <Fragment>
        <div>3</div>
        <div>3</div>
      </Fragment>
    </Fragment>
  );

render(<MakeVDom />, document.getElementById('root'));
