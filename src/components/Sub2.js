import { h, Fragment } from '../wDom';

export default function Sub2({ props, children }) {
  const componentMaker = () => {
    return <div>Sub2</div>;
  };

  return componentMaker;
}
