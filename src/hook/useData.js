export const stateCallSeq = { value: null };
export const stateKeyRef = { value: null };
export const componentKeyMap = {};

const value = {};

export default function useData(initValue) {
  const sKey = stateKeyRef.value;
  const state = makeData({
    initValue,
    stateCallSeq: stateCallSeq.value,
    stateKey: sKey,
    render: () => componentKeyMap[sKey](),
  });

  stateCallSeq.value += 1;

  return state;
}

function makeData({ initValue, stateKey, stateCallSeq, render }) {
  const currentSubSeq = stateCallSeq;

  if (!value[stateKey] || !value[stateKey][currentSubSeq]) {
    value[stateKey] ??= {};
    value[stateKey][currentSubSeq] = initValue;
  }

  const setData = newValue => {
    const originalObject = value[stateKey][currentSubSeq];
    Object.entries(newValue).forEach(([key, value]) => {
      originalObject[key] = value;
    });
    render();
  };

  return [value[stateKey][currentSubSeq], setData];
}
