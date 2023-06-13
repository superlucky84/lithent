import { h, mount, TagFunction } from 'lithent';

const Sub: TagFunction = mount(function Sub() {
  return () => <div>Sub</div>;
});

export default Sub;
