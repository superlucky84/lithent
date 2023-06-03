import { h, Fragment } from 'wwact';

export default function Main() {
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
}
