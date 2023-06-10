import { GlobalData } from '@/examples/jsx/store';
import { h, mountCallback, updateCallback, wwx } from 'wwact';
import { protectedStore, store } from 'wwact/helper';

export default wwx<{
  k: number;
  data: { k: number; j: number };
  handle3: () => void;
}>(function Custom2(renew, props, children) {
  const globalData = protectedStore<GlobalData>('globalData', renew);
  const data7 = store<{ m: number }>({ m: 1 }, renew);
  const data = store<{ v: string }>({ v: '1' }, renew);

  const gdataUpdate = () => {
    console.log('gdataUpdate');
    globalData.increase();
  };
  const handleMounted = () => {
    console.log('CUSTOM2 MOUNTED');
    return () => console.log('CUSTOM2 UNMOUNT');
  };
  const handleUpdated = () => () => {
    console.log('CUSTOM2 UPDATED --');
  };

  const handleInputChane = (event: InputEvent) => {
    data.v = (event.target as HTMLInputElement).value;
  };

  mountCallback(handleMounted);
  updateCallback(handleUpdated, () => [globalData.value]);

  const componentMaker = () => {
    return (
      <div class="custom2">
        {props.k}-{data7.m}--------------{globalData.item}-!{globalData.value}
        <input type="text" value={data.v} onInput={handleInputChane} />
        <button onClick={() => props.handle3()}>handle3</button>
        <button onClick={gdataUpdate}>GlobalDataUpdtae</button>
        <button onClick={globalData.toggleItem}>handle4</button>
        <article>0{children}0</article>
      </div>
    );
  };

  return componentMaker;
});
