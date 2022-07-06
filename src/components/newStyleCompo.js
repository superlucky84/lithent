import { mounted, updated, useData, useRef } from './hook';

const useJw = elementRef => {
  const data = useData({
    a: 1,
    b: 2,
  });

  const handle = () => {
    data.a = 7;
    data.b = 8;
  };

  const effectHandle = () => {
    console.log(data.a, elementRef);
  };

  return [handle, effectHandle];
};

export default function NewStyleComponent() {
  const elementRef = useRef();
  const [handle, effectHandle] = useJw(elementRef);

  const componentMaker = () => {
    mounted(effectHandle);
    updated(effectHandle, [data.a, data.b]);

    return (
      <Fragment>
        <div onClick={handle}>{data.a}</div>
        <div ref={elementRef}>{data.b}</div>
      </Fragment>
    );
  };

  return componentMaker;
}
