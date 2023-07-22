import { mount, render, Fragment, h } from '@/index';

const Item = mount<{ key: number; value: string }>(r => {
  let c = 0;
  const handle = () => {
    c += 1;
    r();
  };

  return ({ value }) => (
    <Fragment>
      <button onClick={handle}>handle</button>
      <div>
        {value} = {c}
      </div>
    </Fragment>
  );
});

const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 1, value: '일' },
    { key: 2, value: '이' },
    { key: 3, value: '삼' },
    { key: 4, value: '사' },
  ];
  const handle = () => {
    list = [
      { key: 3, value: '삼삼' },
      { key: 2, value: '이이' },
    ];
    renew();
  };

  return () => (
    <Fragment>
      <button onClick={handle}>exec</button>
      {list.map(item => (
        <Item key={item.key} value={item.value} />
      ))}
    </Fragment>
  );
});

const Root = <Loop />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));
