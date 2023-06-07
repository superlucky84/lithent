import {
  componentKeyRef,
  makeStateStore,
  componentRef,
} from '@/helper/universalRef';

export default function state<T>(value: T): [() => T, (setValue: T) => void] {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);
  const render = () =>
    (componentRef.get(componentKey)!.redrawAction || (() => {}))();

  let result = value;
  let stateSubscribeDefList = component?.stateSubscribeDefList as T[];
  let stateSubscribeSequence = component?.stateSubscribeSequence as {
    value: number;
  };

  if (
    !stateSubscribeDefList ||
    !stateSubscribeDefList[stateSubscribeSequence.value]
  ) {
    [stateSubscribeSequence, stateSubscribeDefList] =
      makeStateStore<T>(componentKey);
    result = value;
  } else {
    result = stateSubscribeDefList[stateSubscribeSequence.value];
  }

  stateSubscribeDefList[stateSubscribeSequence.value] = result;

  const seqence = stateSubscribeSequence.value;
  const getValue = () => stateSubscribeDefList[seqence];
  const setValue = (value: T) => {
    stateSubscribeDefList[seqence] = value;
    render();
  };

  stateSubscribeSequence.value += 1;

  return [getValue, setValue];
}
