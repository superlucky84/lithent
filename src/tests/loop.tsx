import { mount, render, Fragment, h } from '@/index';

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
      <button onClick={handle}>handle</button>
      {list.map(item => (
        <div key={item.key}>{item.value}</div>
      ))}
    </Fragment>
  );
});

const Root = <Loop />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));
