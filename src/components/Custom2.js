import { h, Fragment } from '../wDom';
import { mounted, unmount, updated, useDataStore, makeData } from '@/hook';

export default function Custom2({ props, children }) {
  const globalData = useDataStore('globalData');
  const data7 = makeData({ m: 1 });
  const data = makeData({ v: 1 });
  const promiseTest = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(999);
      }, 3000);
    });
  };
  const gdataUpdate = () => {
    console.log('gdataUpdate');
    globalData.increase();
  };
  const handleMounted = async () => {
    console.log('CUSTOM2 MOUNTED');

    /*
    const resolveValue = await promiseTest();
    console.log(resolveValue);
    data.v = resolveValue;
    */
  };
  const handleUnmount = () => {
    console.log('CUSTOM2 UNMOUNT');
  };
  const handleUpdated = async () => {
    console.log('CUSTOM2 UPDATED --');
  };
  const handleInputChane = event => {
    data.v = event.target.value;
  };

  const componentMaker = () => {
    mounted(handleMounted);
    unmount(handleUnmount);
    updated(handleUpdated, [globalData.value]);

    return (
      <div class="custom2">
        {props.k}-0--------------{globalData.item}-{globalData.value}
        <input type="text" value={data.v} onInput={handleInputChane} />
        <button onClick={() => props.handle3()}>handle3</button>
        <button onClick={gdataUpdate}>gdataupdate</button>
        <button onClick={globalData.toggleItem}>handle4</button>
        <article>0{children}0</article>
      </div>
    );
  };

  return componentMaker;
}
