import { render, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';
import TestMdx from '@/testmdx.mdx';

const Aa = mount(() => {
  return () => (
    <Fragment>
      <h2>mark down title</h2>
      <div>22</div>
    </Fragment>
  );
});

const Component = mount((r, _props) => {
  const cType = state('markdown', r);

  const change = () => {
    cType.value = cType.value === 'markdown' ? 'element' : 'markdown';
  };

  // Updater
  return () => (
    <Fragment>
      <button onClick={change}>change</button>
      {cType.value === 'markdown' ? <TestMdx /> : <Aa />}
    </Fragment>
  );
});

render(<Component />, document.getElementById('root'));
