import { h, mount } from 'lithent';
import { renderToString } from '@/index';

const Root = mount(_r => {
  return () => (
    <div style={{ border: '1px solid red' }}>
      <span id="aa11">123124</span>
    </div>
  );
});

const result = renderToString(<Root />);

console.log(result);
