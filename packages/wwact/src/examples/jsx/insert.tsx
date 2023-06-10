// example.jsx
import { h, Fragment, render, wwx, state } from 'wwact';

const Root = wwx(function (renew) {
  const showFive = state<boolean>(true, renew);
  const showSix = state<boolean>(true, renew);

  const toggleFive = () => {
    showFive.v = !showFive.v;
  };

  const toggleSix = () => {
    showSix.v = !showSix.v;
  };

  return () => (
    <Fragment>
      <li>
        4 <button onClick={toggleFive}>ShowFive</button>
        <button onClick={toggleSix}>ShowSix</button>
      </li>
      {showFive.v ? <li>5</li> : null}
      {showSix.v ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
});

render(
  <Root />,
  document.getElementById('list-root'),
  document.getElementById('8')
);
