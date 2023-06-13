import { h, mount, TagFunction } from 'lithent';
import useParams from '@/hook/params';

const Sub2: TagFunction = mount(function () {
  const params = useParams();
  const handle = () => {
    console.log('red', params);
  };

  return () => (
    <div style={{ color: 'red' }} onClick={handle}>
      Sub222
    </div>
  );
});

export default Sub2;
