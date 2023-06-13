import { h, Fragment, mount, render } from '@/index';

const Nested = mount(function (renew) {
  let choiceNode = 7;

  const handle = () => {
    const randomValue = Math.floor(Math.random() * 10) + 1;
    choiceNode = randomValue;
    renew();
  };

  const componentMaker = () => {
    return (
      <Fragment>
        <button onClick={handle}>handle</button>
        {choiceNode === 1 && <div>1</div>}
        {choiceNode === 2 && <div>2</div>}
        <Fragment>
          {choiceNode === 3 && <div>3</div>}
          {choiceNode === 4 && <div>4</div>}
          <Fragment>
            {choiceNode === 5 && <div>5</div>}
            {choiceNode === 6 && <div>6</div>}
            <div>6.5</div>
            {choiceNode === 7 && <div>7</div>}
          </Fragment>
          {choiceNode === 8 && <div>8</div>}
          {choiceNode === 9 && <div>9</div>}
        </Fragment>
        {choiceNode === 10 && <div>10</div>}
        <div>11</div>
      </Fragment>
    );
  };

  return componentMaker;
});

const Root = <Nested />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));
