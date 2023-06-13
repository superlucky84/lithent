// example.jsx
import { h, Fragment, render, mount } from '@/index';

const Root = mount(function (renew) {
  let showFive = false;
  let showSix = false;

  const toggleFive = () => {
    showFive = !showFive;
    renew();
  };

  const toggleSix = () => {
    showSix = !showSix;
    renew();
  };

  return () => (
    <Fragment>
      <li>
        4 <button onClick={toggleFive}>ShowFive</button>
        <button onClick={toggleSix}>ShowSix</button>
      </li>
      {showFive ? <li>5</li> : null}
      {showSix ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
});

render(
  <Root />,
  document.getElementById('list-root'),
  document.getElementById('8')
);
