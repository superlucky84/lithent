import { h, Fragment } from '../wDom';
import mounted from '@/hook/mounted';
import unmount from '@/hook/unmount';

export default function Custom2({ props, children }) {
  const handleMounted = () => {
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
        <article>{children}</article>
      </div>
    );
  };

  return componentMaker;
}
