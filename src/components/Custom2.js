import { h, Fragment } from '../wDom';
import { mounted, unmount, updated, useDataStore, makeData } from '@/hook';

export default function Custom2({ props, children }) {
  const globalData = useDataStore('globalData');
  const data7 = makeData({ m: 1 });
  const data = makeData({ v: 1 });
  const handleMounted = () => {
    console.log('hr', props.hadleRef);
    console.log('CUSTOM2 MOUNTED');
  };
  const handleUnmount = () => {
    console.log('CUSTOM2 UNMOUNT');
  };
  const handleUpdated = () => {
    console.log('CUSTOM2 UPDATED --');
  };
  const handleInputChane = event => {
    data.v = event.target.value;
  };

  const componentMaker = () => {
    mounted(handleMounted);
    unmount(handleUnmount);
    updated(handleUpdated);

    return (
      <div class="custom2">
        {props.k}-0--------------{globalData.item}
        <input type="text" value={data.v} onInput={handleInputChane} />
        <button onClick={() => props.handle3()}>handle3</button>
        <button
          onClick={() => {
            globalData.item = globalData.item === 'kkk' ? 'jjj' : 'kkk';
          }}
        >
          handle4
        </button>
        <article>0{children}0</article>
      </div>
    );
  };

  return componentMaker;
}
