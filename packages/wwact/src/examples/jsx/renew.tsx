// example.jsx
import { h, Fragment, render, Props, WDom, Renew } from 'wwact';
import { state2 } from '@/wwactStore';

function Renew(_props: Props, _children: WDom[], _renew: Renew) {
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;
  let count4 = 0;
  const count5 = state2<number>(7);

  const change = () => {
    count1 += 1;
    count2 += 2;
    count3 += 3;
    count4 -= 1;
    count5.set(count5.val * 2);
    // renew();
  };

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <li>count2: {count2}</li>
      <li>count3: {count3}</li>
      <li>count4: {count4}</li>
      <li>number: {count5.v}</li>
      <button onClick={change}>change</button>
    </Fragment>
  );
}

render(<Renew />, document.getElementById('root'));
