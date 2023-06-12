import { h, Fragment, mount, TagFunction } from 'wwact';

const Main: TagFunction = mount(function Main() {
  const componentMaker = () => {
    return (
      <div>
        <Fragment>
          <div>3</div>
          <div>3</div>
        </Fragment>
      </div>
    );
  };
  return componentMaker;
});

export default Main;
