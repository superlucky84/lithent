import { h, Fragment } from '../jsx';

export default function Custom2({ props, children }) {
  const componentMaker = () => {
    return (
      <div class="custom2">
        {props.k}
        <article>{children}</article>
      </div>
    );
  };

  return componentMaker;
}
