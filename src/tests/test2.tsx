import { h, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

type StoreValue = {
  [key: string | symbol]: (() => boolean)[];
};

const storeGroup = new Map<string | symbol, unknown>();
const storeRenderList: StoreValue = {};
const storeRenderObserveMap: {
  [key: string | symbol]: StoreValue;
} = {};

export const store = <T extends {}>(value: T) => {
  const storeKey = Symbol();
  storeGroup.set(storeKey, value);

  return (renew?: () => boolean, makeObserver?: (store: T) => unknown[]) => {
    if (renew) {
      if (makeObserver) {
        const renewRef: { value: (() => boolean) | null } = { value: renew };
        const makedProxy = updater<T>(storeKey, renewRef);

        makeObserver(makedProxy);
        renewRef.value = null;

        return makedProxy;
      } else {
        storeRenderList[storeKey] ??= [];
        storeRenderList[storeKey].push(renew);
      }
    }

    return updater<T>(storeKey);
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  storeKey: string | symbol,
  renewRef?: { value: (() => boolean) | null }
) => {
  const allowedAccessProp: (keyof T)[] = [];

  return new Proxy(storeGroup.get(storeKey) as T, {
    get(target: T, prop: keyof T) {
      if (renewRef?.value) {
        storeRenderObserveMap[storeKey] ??= {};
        storeRenderObserveMap[storeKey][prop] ??= [];

        if (!storeRenderObserveMap[storeKey][prop].includes(renewRef.value)) {
          storeRenderObserveMap[storeKey][prop].push(renewRef.value);
          allowedAccessProp.push(prop);
        }
      }

      if (allowedAccessProp.includes(prop) || !renewRef) {
        return target[prop];
      }

      return null;
    },
    set(target, prop: keyof T, value) {
      if (allowedAccessProp.includes(prop) || !renewRef) {
        target[prop] = value;
      }

      const renderList = storeRenderList[storeKey] || [];
      const renderObserveList: (() => boolean)[] = renewRef
        ? storeRenderObserveMap[storeKey][prop] || []
        : [];
      const trashCollections: (() => boolean)[] = [];

      renderList.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      renderObserveList.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      trashCollections.forEach(deleteTarget => {
        renderList.splice(renderList.indexOf(deleteTarget), 1);
        renderObserveList.splice(renderObserveList.indexOf(deleteTarget), 1);
      });

      return true;
    },
  });
};

const assignShardStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Component = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  testChangeRef.value = () => {
    shardStore.text = 'newSharedText';
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

document.body.innerHTML = `<div id="root"><span>1</span><span>2</span><span>3</span></div>`;

const testWrap = document.getElementById('root') as HTMLElement;

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(2)') as HTMLElement
);

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(3)') as HTMLElement
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('A DOM should be created with the textarea inserted in the middle, and the initial values you set for the textarea should be set.', () => {
    expect(testWrap?.querySelector('textarea')?.value).toBe('sharedText');
  });

  it('If you change the value of the store, the value of the textarea should also change.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap?.querySelector('textarea')?.value).toBe('newSharedText');
    });
  });
}
