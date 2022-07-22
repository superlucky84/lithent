import { h } from '@/wDom';
import useParams from '@/hook/params';

export default function Sub2() {
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
