/**
 * DataStore
 */
type Renew<T> = (store: T) => boolean | AbortSignal | void;
type Run = () => boolean | AbortSignal | void;
type StoreType<V> = V extends { [key: string]: unknown } ? V : { value: V };
type StoreValue = {
  [key: string | symbol]: Set<Run>;
};

const DEFAULT_OPTION = { cache: true };

export const store = <V>(initialValue: V) => {
  type T = StoreType<V>;

  const allowInitSetting = { value: false };
  const isObjectTypeValue =
    !Array.isArray(initialValue) &&
    typeof initialValue === 'object' &&
    initialValue !== null;
  const value: T = isObjectTypeValue
    ? (initialValue as T)
    : ({ value: initialValue } as T);

  const storeRenderList: Set<Run> = new Set();
  const storeRenderObserveList: StoreValue[] = [];
  const cacheMap = new WeakMap<Renew<T>, T>();

  return (
    renew?: Renew<T>,
    makeObserver?: ((store: T) => unknown[]) | null,
    userOption?: { cache?: boolean }
  ) => {
    const { cache } = Object.assign({}, DEFAULT_OPTION, userOption || {});

    if (cache && renew && cacheMap.has(renew)) {
      return cacheMap.get(renew)!;
    }

    const storeRenderObserveMap: StoreValue = {};
    // const allowedAccessProp: (keyof T)[] = [];
    const allowedAccessProp: Set<keyof T> = new Set();

    let makedProxy: { value: null | T } = { value: null };
    let run: Run = () => {};

    storeRenderObserveList.push(storeRenderObserveMap);

    if (renew && makeObserver) {
      run = () => renew(makedProxy.value!);
      makedProxy.value = updater<T>(
        value,
        allowInitSetting,
        storeRenderList,
        allowedAccessProp,
        run,
        storeRenderObserveMap,
        storeRenderObserveList
      );
      allowInitSetting.value = true;
      makeObserver(makedProxy.value);
      allowInitSetting.value = false;
    }

    if (!makedProxy.value) {
      makedProxy.value = updater<T>(
        value,
        allowInitSetting,
        storeRenderList,
        allowedAccessProp
      );

      if (renew) {
        run = () => renew(makedProxy.value!);
        storeRenderList.add(run);
      }
    }

    if (renew) {
      runFirstEmit<T>(
        run,
        storeRenderList,
        storeRenderObserveMap,
        allowedAccessProp
      );
      cacheMap.set(renew, makedProxy.value);
    }

    return makedProxy.value;
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  value: T,
  allowInitSetting: { value: boolean },
  storeRenderList: Set<Run>,
  allowedAccessProp: Set<keyof T>,
  run?: Run,
  storeRenderObserveMap?: StoreValue,
  storeRenderObserveList?: StoreValue[]
) => {
  const result = new Proxy(value, {
    get(target: T, prop: keyof T) {
      if (run && storeRenderObserveMap && allowInitSetting.value) {
        storeRenderObserveMap[prop] ??= new Set();

        if (!storeRenderObserveMap[prop].has(run)) {
          storeRenderObserveMap[prop].add(run);
          allowedAccessProp.add(prop);
        }
      }

      return target[prop];
    },
    set(target, prop: keyof T, value) {
      if (target[prop] === value) {
        return true;
      }

      target[prop] = value;

      execDependentCallbacks(
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
  storeRenderList: Set<Run>,
  storeRenderObserveList: StoreValue[] = [],
  prop: keyof T,
  run?: () => boolean | AbortSignal | void
) => {
  const trashCollections: Set<Run> = new Set();

  // trashCollections.push(...runWithtrashCollectUnit(storeRenderList));
  runWithtrashCollectUnit(storeRenderList).forEach(value =>
    trashCollections.add(value)
  );

  (storeRenderObserveList || []).forEach(storeRenderObserveMap => {
    const renderObserveList: Set<Run> = run
      ? storeRenderObserveMap[prop] || new Set<Run>()
      : new Set<Run>();

    runWithtrashCollectUnit(renderObserveList).forEach(value =>
      trashCollections.add(value)
    );

    removeTrashCollect(trashCollections, renderObserveList);
  });

  removeTrashCollect(trashCollections, storeRenderList);
};

const removeTrashCollect = (
  trashCollections: Set<Run>,
  targetList: Set<Run>
) => {
  trashCollections.forEach(deleteTarget => {
    targetList.delete(deleteTarget);
  });
};

const runWithtrashCollectUnit = (storeRenderList: Set<Run>) => {
  const trashes: Run[] = [];
  storeRenderList.forEach(run => {
    if (run() === false) {
      trashes.push(run);
    }
  });
  return trashes;
};

const runFirstEmit = <T>(
  run: () => boolean | void | AbortSignal,
  storeRenderList: Set<Run>,
  storeRenderObserveMap: StoreValue,
  allowedAccessProp: Set<keyof T>
) => {
  const renewResult = run();

  if (renewResult instanceof AbortSignal) {
    renewResult.addEventListener('abort', () => {
      const renderObserveList: StoreValue = storeRenderObserveMap || {};

      storeRenderList.delete(run);

      Object.entries(renderObserveList).forEach(([key, item]) => {
        item.delete(run);
        allowedAccessProp.delete(key as keyof T);
      });
    });
  }
};
