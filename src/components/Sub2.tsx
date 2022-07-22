import { h, Fragment } from '../wDom';
import useParams from '@/hook/params';

export default function Sub2(props, children) {
  const params = useParams();
  const handle = () => {
    console.log('a', params);
  };

  const componentMaker = () => {
    return (
      <div style={{ color: 'red' }} onClick={handle}>
        Sub222
      </div>
    );
  };

  return componentMaker;
}
