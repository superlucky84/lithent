import { h, Fragment } from '@/wDom';
import { makeRef, updated, makeData } from '@/hook';
import CustomElement from '@/components/CustomElement';

export default function LoopTest(props, children) {
  const data = makeData({
    list: [
      { key: 1, value: '일' },
      { key: 2, value: '이' },
      { key: 3, value: '삼' },
      { key: 4, value: '사' },
    ],
  });
  const handle = () => {
    data.list = [
      { key: 3, value: '삼삼' },
      { key: 2, value: '이이' },
    ];
  };

  const componentMaker = () => {
    return (
      <Fragment>
        <button onClick={handle}>handle</button>
        {data.list.map(item => (
          <div key={item.key}>{item.value}</div>
        ))}
      </Fragment>
    );
  };

  return componentMaker;
}