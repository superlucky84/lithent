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
    value[stateKey][currentSubSeq] = makeProxyData(initValue, render);
  }

  return value[stateKey][currentSubSeq];
}

function makeProxyData(initValue, render) {
  return new Proxy(initValue, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      render();

      return true;
    },
  });
}
