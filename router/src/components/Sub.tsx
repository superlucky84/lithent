import { h, mount, TagFunction } from 'wwact';

const Sub: TagFunction = mount(function Sub() {
  return () => <div>Sub</div>;
});

export default Sub;
