import { h, Fragment } from '../wDom';
import mounted from '@/hook/mounted';
import unmount from '@/hook/unmount';

export default function Custom2({ props, children }) {
  const handleMounted = () => {
    console.log('hr', props.hadleRef);
    console.log('CUSTOM2 MOUNTED');
  };
  const handleUnmount = () => {
    console.log('CUSTOM2 UNMOUNT');
  };
  const componentMaker = () => {
    mounted(handleMounted);
    unmount(handleUnmount);

    return (
      <div class="custom2">
        {props.k}-0--------------
        <button onClick={() => props.hadleRef.value.handle3()}>handle3</button>
        <article>0{children}0</article>
      </div>
    );
  };

  return componentMaker;
}
