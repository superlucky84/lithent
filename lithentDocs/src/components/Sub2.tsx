import { h, mount } from 'lithent';

export default mount(function Sub2() {
  return () => <div style={{ color: 'red' }}>Sub222</div>;
});
