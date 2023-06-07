// example.jsx
import { h, Fragment, render, state } from '@/index';

function Root() {
  const [getShowFive, setShowFive] = state<boolean>(true);
  const [getShowSix, setShowSix] = state<boolean>(true);

  const toggleFive = () => {
    setShowFive(!getShowFive());
  };

  const toggleSix = () => {
    setShowSix(!getShowSix());
  };

  return () => (
    <Fragment>
      <li>
        4 <button onClick={toggleFive}>ShowFive</button>
        <button onClick={toggleSix}>ShowSix</button>
      </li>
      {getShowFive() ? <li>5</li> : null}
      {getShowSix() ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
}

render(
  <Root />,
  document.getElementById('list-root'),
  document.getElementById('8')
);
