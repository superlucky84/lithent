// example.jsx
import { h, Fragment, render, makeUpdater } from '@/index';

function Root() {
  const parentState = makeUpdater<{ showFive: boolean; showSix: boolean }>({
    showFive: true,
    showSix: true,
  });

  const toggleFive = () => {
    parentState.showFive = !parentState.showFive;
  };

  const toggleSix = () => {
    parentState.showSix = !parentState.showSix;
  };

  return () => (
    <Fragment>
      <li>
        4 <button onClick={toggleFive}>ShowFive</button>
        <button onClick={toggleSix}>ShowSix</button>
      </li>
      {parentState.showFive ? <li>5</li> : null}
      {parentState.showSix ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
}

render(
  <Root />,
  document.getElementById('list-root'),
  document.getElementById('8')
);
