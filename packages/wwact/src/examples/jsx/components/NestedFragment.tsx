import { h, Fragment } from '@/wDom';
import { makeData } from '@/index';

export default function NestedFragment() {
  const data = makeData<{ choiceNode: number }>({ choiceNode: 7 });
  const handle = () => {
    const randomValue = Math.floor(Math.random() * 10) + 1;
    data.choiceNode = randomValue;
  };

  const componentMaker = () => {
    return (
      <Fragment>
        <button onClick={handle}>handle</button>
        {data.choiceNode === 1 && <div>1</div>}
        {data.choiceNode === 2 && <div>2</div>}
        <Fragment>
          {data.choiceNode === 3 && <div>3</div>}
          {data.choiceNode === 4 && <div>4</div>}
          <Fragment>
            {data.choiceNode === 5 && <div>5</div>}
            {data.choiceNode === 6 && <div>6</div>}
            <div>6.5</div>
            {data.choiceNode === 7 && <div>7</div>}
          </Fragment>
          {data.choiceNode === 8 && <div>8</div>}
          {data.choiceNode === 9 && <div>9</div>}
        </Fragment>
        {data.choiceNode === 10 && <div>10</div>}
        <div>11</div>
      </Fragment>
    );
  };

  return componentMaker;
}
