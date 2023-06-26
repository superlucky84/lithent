import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const storeGroup = new Map<string | symbol, unknown>();
const storeRenderList: {
  [key: string | symbol]: (() => boolean)[];
} = {};

export const store = <T extends {}>(value: T) => {
  const storeKey = Symbol();
  storeGroup.set(storeKey, value);

  return (renew: () => boolean) => {
    storeRenderList[storeKey] ??= [];
    storeRenderList[storeKey].push(renew);

    return updater<T>(storeKey);
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  storeKey: string | symbol
) =>
  new Proxy(storeGroup.get(storeKey) as T, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      const renderList = storeRenderList[storeKey];
      const trashCollections: (() => boolean)[] = [];

      renderList.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      trashCollections.forEach(deleteTarget =>
        renderList.splice(renderList.indexOf(deleteTarget), 1)
      );

      return true;
    },
  });

const Component = mount(r => {
  const local = store<{ count1: number; count2: number; count3: number }>({
    count1: 1,
    count2: 1,
    count3: 1,
  })(r);

  const click = () => {
    local.count1 += 1;
    local.count2 -= 1;
    local.count3 *= 2;
  };
  testChangeRef.value = click;
  return () => (
    <>
      <div>count1: {local.count1}</div>
      <div>count2: {local.count2}</div>
      <div>count3: {local.count3}</div>
      <button type="text" onClick={click}>
        change count
      </button>
    </>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Component />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('A DOM should be created that reflects the initial values of your store.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><div>count1: 1</div><div>count2: 1</div><div>count3: 1</div><button type="text">change count</button></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
  });
  it('You should see a DOM that reflects the changed store values.', () => {
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div>count1: 4</div><div>count2: -2</div><div>count3: 8</div><button type="text">change count</button></div>'
      );
    });
  });
}
