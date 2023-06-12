import { h, mount, TagFunction } from 'wwact';
import useParams from '@/hook/params';

const Sub2: TagFunction = mount(function Sub2() {
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
});

export default Sub2;
