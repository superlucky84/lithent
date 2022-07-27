import { h, Fragment } from '../wDom';
import CustomElement from '@/components/CustomElement';

export default function Main() {
  const componentMaker = () => {
    return (
      <div>
        <CustomElement vava={7} />
        <CustomElement vava={7} />
        <Fragment>
          <div>3</div>
          <div>3</div>
        </Fragment>
      </div>
    );
  };

  return componentMaker;
}
