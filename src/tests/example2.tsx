// example.jsx
import {
  h,
  Fragment,
  mountCallback,
  render,
  Renew,
  mount,
  ref,
  nextTick,
} from '@/index';
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

const assignShardStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Component = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  return () => (
    <textarea
      type="text"
      onInput={changeInput}
      value={shardStore.text}
      style={{ width: '100px', height: '100px' }}
    />
  );
});

/*
<div ref={htmlRef}>
  <span class="p-2">1</span>
  <span class="p-2">2</span>
  <span class="p-2">3</span>
</div>
*/

render(
  <Component />,
  element,
  element.querySelector('span:nth-of-type(2)') as HTMLElement
);

render(
  <Component />,
  element,
  element.querySelector('span:nth-of-type(3)') as HTMLElement
);

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Renew />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Is renew working properly?', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><li>count1: 0</li><li>count2: 0</li><li>count3: 0</li><li>count4: 0</li><button>change</button></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><li>count1: 3</li><li>count2: 6</li><li>count3: 9</li><li>count4: -3</li><button>change</button></div>'
      );
    });
  });
}
