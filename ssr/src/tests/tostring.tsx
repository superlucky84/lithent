import { h, mount } from 'lithent';
import { renderToString } from '@/index';

const Root = mount(_r => {
  return () => (
    <div>
      <span>123124</span>
    </div>
  );
});

const result = renderToString(<Root />);

console.log(result);
