/**
 * DataStore
 */
type Renew<T> = (store: T) => boolean | AbortSignal | void;
type StoreType<V> = V extends { [key: string]: unknown } ? V : { value: V };
type StoreValue<T> = {
  [key: string | symbol]: Renew<T>[];
};
type StoreRenderObserveSubList<T> = StoreValue<T>;

export const store = <V>(initialValue: V) => {
  type T = StoreType<V>;

  const allowInitSetting = { value: false };
  const isObjectTypeValue =
    typeof initialValue === 'object' && initialValue !== null;
  const value: T = isObjectTypeValue
    ? (initialValue as T)
    : ({ value: initialValue } as T);

  let storeRenderList: Renew<T>[] = [];
  const storeRenderObserveList: StoreRenderObserveSubList<T>[] = [];

  return (renew?: Renew<T>, makeObserver?: (store: T) => unknown[]) => {
    const storeRenderObserveMap: StoreRenderObserveSubList<T> = {};
    let makedProxy: null | T = null;

    storeRenderObserveList.push(storeRenderObserveMap);

    if (renew && makeObserver) {
      makedProxy = updater<T>(
        value,
        allowInitSetting,
        storeRenderList,
        () => renew(makedProxy!),
        storeRenderObserveMap,
        storeRenderObserveList
      );
      allowInitSetting.value = true;
      makeObserver(makedProxy);
      allowInitSetting.value = false;
    }

    if (!makedProxy) {
      makedProxy = updater<T>(value, allowInitSetting, storeRenderList);

      if (renew) {
        storeRenderList.push(() => renew(makedProxy!));
      }
    }

    if (renew) {
      runFirstEmit<T>(
        () => renew(makedProxy!),
        storeRenderList,
        storeRenderObserveMap
      );
    }

    return makedProxy;
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  value: T,
  allowInitSetting: { value: boolean },
  storeRenderList: Renew<T>[],
  run?: () => boolean | AbortSignal | void,
  storeRenderObserveMap?: StoreValue<T>,
  storeRenderObserveList?: StoreRenderObserveSubList<T>[]
) => {
  const allowedAccessProp: (keyof T)[] = [];

  const result = new Proxy(value, {
    get(target: T, prop: keyof T) {
      if (run && storeRenderObserveMap && allowInitSetting.value) {
        storeRenderObserveMap[prop] ??= [];

        if (!storeRenderObserveMap[prop].includes(run)) {
          storeRenderObserveMap[prop].push(run);
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

      execDependentCallbacks(
        result,
        storeRenderList,
        storeRenderObserveList,
        prop,
        run
      );

      return true;
    },
  });

  return result;
};

const execDependentCallbacks = <T>(
  result: T,
  storeRenderList: Renew<T>[],
  storeRenderObserveList: StoreRenderObserveSubList<T>[] = [],
  prop: keyof T,
  run?: () => boolean | AbortSignal | void
) => {
  const trashCollections: Renew<T>[] = [];

  trashCollections.push(...runWithtrashCollectUnit(storeRenderList, result));

  (storeRenderObserveList || []).forEach(storeRenderObserveMap => {
    const renderObserveList: Renew<T>[] = run
      ? storeRenderObserveMap[prop] || []
      : [];

    trashCollections.push(
      ...runWithtrashCollectUnit(renderObserveList, result)
    );

    removeTrashCollect(trashCollections, renderObserveList);
  });

  removeTrashCollect(trashCollections, storeRenderList);
};

const removeTrashCollect = <T>(
  trashCollections: Renew<T>[],
  targetList: Renew<T>[]
) => {
  trashCollections.forEach(deleteTarget => {
    targetList.splice(targetList.indexOf(deleteTarget), 1);
  });
};

const runWithtrashCollectUnit = <T>(storeRenderList: Renew<T>[], result: T) => {
  const trashes: Renew<T>[] = [];
  storeRenderList.forEach(renew => {
    if (renew(result) === false) {
      trashes.push(renew);
    }
  });
  return trashes;
};

const runFirstEmit = <T>(
  run: () => boolean | void | AbortSignal,
  storeRenderList: Renew<T>[],
  storeRenderObserveMap: StoreValue<T>
) => {
  const renewResult = run();

  if (renewResult instanceof AbortSignal) {
    renewResult.addEventListener('abort', () => {
      const renderObserveList: StoreValue<T> = storeRenderObserveMap || {};

      storeRenderList.splice(storeRenderList.indexOf(run), 1);
      Object.values(renderObserveList).forEach(item => {
        item.splice(item.indexOf(run), 1);
      });
    });
  }
};
