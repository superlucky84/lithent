import { h, mount } from 'lithent';
import { renderToString } from '@/index';

const Root = mount(_r => {
  return () => (
    <div style={{ border: '1px solid red' }}>
      asve
      <br />
      <section innerHTML="<article>ss</article>" />
      <button disabled={true}>a</button>
      <span id="aa11" data-max-string="va">
        {'  '}123124
      </span>
    </div>
  );
});

const result = renderToString(<Root />);

console.log(result);
