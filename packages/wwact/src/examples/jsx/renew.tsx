// example.jsx
import { h, Fragment, render, Props, WDom, Renew } from 'wwact';

function Renew(_props: Props, _children: WDom[], renew: Renew) {
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;
  let count4 = 0;

  const change = () => {
    count1 += 1;
    count2 += 2;
    count3 += 3;
    count4 -= 1;
    renew();
  };

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <li>count2: {count2}</li>
      <li>count3: {count3}</li>
      <li>count4: {count4}</li>
      <button onClick={change}>change</button>
    </Fragment>
  );
}

render(<Renew />, document.getElementById('root'));
