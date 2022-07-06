export const stateCallSeq = { value: null };
export const stateKeyRef = { value: null };
export const componentKeyMap = {};

const value = {};

export default function useState(initValue) {
  const sKey = stateKeyRef.value;
  const state = makeState({
    initValue,
    stateCallSeq: stateCallSeq.value,
    stateKey: sKey,
    render: () => componentKeyMap[sKey](),
  });

  stateCallSeq.value += 1;

  return state;
}

function makeState({ initValue, stateKey, stateCallSeq, render }) {
  const currentSubSeq = stateCallSeq;

  if (!value[stateKey] || !value[stateKey][currentSubSeq]) {
    value[stateKey] ??= {};
    value[stateKey][currentSubSeq] ??= {};
    value[stateKey][currentSubSeq] = initValue;
  }

  const setData = newValue => {
    value[stateKey][currentSubSeq] = newValue;
    render();
  };

  return [value[stateKey][currentSubSeq], setData];
}
