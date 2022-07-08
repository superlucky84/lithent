import { h, Fragment } from '../jsx';
import mounted from '@/hook/mounted';

export default function Custom2({ props, children }) {
  const handleMounted = () => {
    console.log('CUSTOM2 MOUNTED');
  };
  const componentMaker = () => {
    mounted(handleMounted);

    return (
      <div class="custom2">
        {props.k}-0--------------
        <article>{children}</article>
      </div>
    );
  };

  return componentMaker;
}
