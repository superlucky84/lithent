import { h, Fragment } from '../wDom';

export default function Sub({ props, children }) {
  const componentMaker = () => {
    return <div>Sub</div>;
  };

  return componentMaker;
}
