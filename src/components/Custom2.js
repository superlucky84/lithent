import { h, Fragment } from '../wDom';
import { mounted, unmount, updated, useDataStore, makeData } from '@/hook';

export default function Custom2({ props, children }) {
  const globalData = useDataStore('globalData');
  const data7 = makeData({ m: 1 });
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
  const componentMaker = () => {
    mounted(handleMounted);
    unmount(handleUnmount);
    updated(handleUpdated);

    return (
      <div class="custom2">
        {props.k}-0--------------{data7.m}
        <button
          onClick={() => {
            console.log('call3-');
            // props.hadleRef.value.handle3();
            props.handle3();
            // data7.m += 1;
          }}
        >
          handle3
        </button>
        <button
          onClick={() => {
            console.log('ddd');
            globalData.item = 'kkk';
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
