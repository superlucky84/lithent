import { GlobalData } from '@/examples/jsx/store';
import { h, WDom } from '@/index';
import { mounted, update } from '@/index';
import { globalStore, localStore } from '@/wwactStore';

export default function Custom2(
  props: { k: number; data: { k: number; j: number }; handle3: () => void },
  children: WDom[]
) {
  const globalData = globalStore<GlobalData>('globalData');
  const data7 = localStore<{ m: number }>({ m: 1 });
  const data = localStore<{ v: string }>({ v: '1' });

  const gdataUpdate = () => {
    console.log('gdataUpdate');
    globalData.increase();
  };
  const handleMounted = () => {
    console.log('CUSTOM2 MOUNTED');
  };
  const handleUpdated = () => () => {
    console.log('CUSTOM2 UPDATED --');
  };

  const handleInputChane = (event: InputEvent) => {
    data.v = (event.target as HTMLInputElement).value;
  };

  mounted(handleMounted);
  update(handleUpdated, () => [globalData.value]);

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
}
