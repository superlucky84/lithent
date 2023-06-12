import { h, mount, TagFunction } from 'wwact';

const Sub: TagFunction = mount(function Sub() {
  const componentMaker = () => {
    return <div>Sub</div>;
  };
  return componentMaker;
});

export default Sub;
