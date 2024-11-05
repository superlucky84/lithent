import { h, mount } from 'lithent';
import { renderToString } from '@/index';

const Root = mount(_r => {
  return () => <div>123124</div>;
});

const result = renderToString(<Root />);

console.log('RESULT', result);
