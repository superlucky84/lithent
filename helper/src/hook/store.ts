/**
 * DataStore
 */
type StoreType<V> = V extends { [key: string]: unknown } ? V : { value: V };

type Renew<T> = (store: T) => boolean | AbortSignal | void;
type StoreValue<T> = {
  [key: string | symbol]: Renew<T>[];
};
type StoreRenderObserveMap<T> = { [key: string | symbol]: StoreValue<T> };
const storeGroup = new Map<string | symbol, unknown>();
const abortSignalSets = new WeakSet<AbortSignal>();
const allowInitSetting = { value: false };

export const store = <V>(initialValue: V) => {
  type T = StoreType<V>;

  let value = null;
  if (typeof initialValue === 'object' && initialValue !== null) {
    value = initialValue;
  } else {
    value = { value: initialValue };
  }

  const storeKey = Symbol();
  const storeRenderList: StoreValue<T> = {};
  const storeRenderObserveList: StoreRenderObserveMap<T>[] = [];

  storeGroup.set(storeKey, value);

  return (renew?: Renew<T>, makeObserver?: (store: T) => unknown[]) => {
    const storeRenderObserveMap: StoreRenderObserveMap<T> = {};
    let makedProxy: null | T = null;

    storeRenderObserveList.push(storeRenderObserveMap);

    if (renew && makeObserver) {
      makedProxy = updater<T>(
        storeKey,
        storeRenderList,
        () => renew(makedProxy!),
        storeRenderObserveMap,
        storeRenderObserveList
      );
      allowInitSetting.value = true;
      makeObserver(makedProxy);
      allowInitSetting.value = false;
    } else if (renew) {
      storeRenderList[storeKey] ??= [];
    }

    if (!makedProxy) {
      makedProxy = updater<T>(storeKey, storeRenderList);

      if (renew) {
        storeRenderList[storeKey].push(() => renew(makedProxy!));
      }
    }

    if (renew) {
      runFirstEmit<T>(
        () => renew(makedProxy!),
        storeKey,
        storeRenderList,
        storeRenderObserveMap
      );
    }

    return makedProxy;
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  storeKey: string | symbol,
  storeRenderList: StoreValue<T>,
  run?: () => boolean | AbortSignal | void,
  storeRenderObserveMap?: { [key: string | symbol]: StoreValue<T> },
  storeRenderObserveList?: StoreRenderObserveMap<T>[]
) => {
  const allowedAccessProp: (keyof T)[] = [];

  const result = new Proxy(storeGroup.get(storeKey) as T, {
    get(target: T, prop: keyof T) {
      if (run && storeRenderObserveMap && allowInitSetting.value) {
        storeRenderObserveMap[storeKey] ??= {};
        storeRenderObserveMap[storeKey][prop] ??= [];

        if (!storeRenderObserveMap[storeKey][prop].includes(run)) {
          storeRenderObserveMap[storeKey][prop].push(run);
          allowedAccessProp.push(prop);
        }
      }

      if (allowedAccessProp.includes(prop) || !run) {
        return target[prop];
      }

      return null;
    },
    set(target, prop: keyof T, value) {
      if (allowedAccessProp.includes(prop) || !run) {
        target[prop] = value;
      } else {
        return true;
      }

      const renderList = storeRenderList[storeKey] || [];
      const trashCollections: Renew<T>[] = [];

      renderList.forEach(renew => {
        if (!renew(result)) {
          trashCollections.push(renew);
        }
      });

      (storeRenderObserveList || []).forEach(storeRenderObserveMap => {
        const renderObserveList: Renew<T>[] = run
          ? (storeRenderObserveMap && storeRenderObserveMap[storeKey][prop]) ||
            []
          : [];
        renderObserveList.forEach(renew => {
          if (!renew(result)) {
            trashCollections.push(renew);
          }
        });
        trashCollections.forEach(deleteTarget => {
          renderObserveList.splice(renderObserveList.indexOf(deleteTarget), 1);
        });
      });

      trashCollections.forEach(deleteTarget => {
        renderList.splice(renderList.indexOf(deleteTarget), 1);
      });

      return true;
    },
  });

  return result;
};

const runFirstEmit = <T>(
  run: () => boolean | void | AbortSignal,
  storeKey: symbol,
  storeRenderList: StoreValue<T>,
  storeRenderObserveMap: { [key: string | symbol]: StoreValue<T> }
) => {
  const renewResult = run();

  if (renewResult instanceof AbortSignal) {
    renewResult.addEventListener('abort', () => {
      const renderList = storeRenderList[storeKey] || [];
      const renderObserveList: StoreValue<T> =
        storeRenderObserveMap[storeKey] || {};

      renderList.splice(renderList.indexOf(run), 1);
      Object.values(renderObserveList).forEach(item => {
        item.splice(item.indexOf(run), 1);
      });
      abortSignalSets.delete(renewResult);
    });
    abortSignalSets.add(renewResult);
  }
};
