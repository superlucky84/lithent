import {
  componentKeyRef,
  makeStateStore,
  componentRef,
} from '@/helper/universalRef';

const state = <T>(value: T): [() => T, (setValue: T) => void] => {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);
  const render = () =>
    (componentRef.get(componentKey)!.redrawAction || (() => {}))();

  let result = value;
  let stateVal = component?.stateVal as T[];
  let stateSeq = component?.stateSeq as {
    value: number;
  };

  if (!stateVal || !stateVal[stateSeq.value]) {
    [stateSeq, stateVal] = makeStateStore<T>(componentKey);
    result = value;
  } else {
    result = stateVal[stateSeq.value];
  }

  stateVal[stateSeq.value] = result;

  const seqence = stateSeq.value;

  stateSeq.value += 1;

  return [
    () => stateVal[seqence],
    (value: T) => {
      stateVal[seqence] = value;
      render();
    },
  ];
};

export default state;
