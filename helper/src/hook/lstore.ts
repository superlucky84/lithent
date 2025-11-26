import { useRenew } from 'lithent';

/**
 * DataStore for lmount components
 */
export type StoreRenew<T> = (store: T) => boolean | AbortSignal | void;
export type StoreType<V> = V extends { [key: string]: unknown }
  ? V
  : { value: V };
export type StoreObserver<T> = (store: T) => unknown[];
export type StoreOptions = { cache?: boolean };

type Run = () => boolean | AbortSignal | void;
type StoreValue = {
  [key: string | symbol]: Set<Run>;
};

const DEFAULT_OPTION = { cache: true };

/**
 * 리액티브 스토어 생성 (lmount 전용)
 */
export function lstore<V>(initialValue: V) {
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
  const cacheMap = new WeakMap<StoreRenew<T>, T>();

  const internalStore = (
    renew?: StoreRenew<T>,
    makeObserver?: StoreObserver<T> | null,
    userOption?: StoreOptions
  ) => {
    const { cache } = Object.assign({}, DEFAULT_OPTION, userOption || {});

    if (cache && renew && cacheMap.has(renew)) {
      return cacheMap.get(renew)!;
    }

    const storeRenderObserveMap: StoreValue = {};
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
        storeRenderObserveList,
        run,
        storeRenderObserveMap
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
        allowedAccessProp,
        storeRenderObserveList
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

  return {
    /**
     * 자동으로 useRenew를 사용하여 구독 (lmount 컴포넌트에서 사용)
     * makeObserver 없으면 전체 구독, 있으면 선택적 필드만 구독
     */
    useStore(
      makeObserver?: StoreObserver<T> | null,
      userOption?: StoreOptions
    ): T {
      const renew = useRenew();
      return internalStore(renew, makeObserver, userOption);
    },

    /**
     * 수동으로 renew를 제공하여 구독 (mount 컴포넌트에서 사용)
     * renew 없이 호출하면 구독 없이 현재 값만 참조
     */
    watch(
      renew?: StoreRenew<T>,
      makeObserver?: StoreObserver<T> | null,
      userOption?: StoreOptions
    ): T {
      return internalStore(renew, makeObserver, userOption);
    },
  };
}

/**
 * 사용자에게 노출될 프록시 개체 생성
 */
function updater<T extends { [key: string | symbol]: unknown }>(
  value: T,
  allowInitSetting: { value: boolean },
  storeRenderList: Set<Run>,
  allowedAccessProp: Set<keyof T>,
  storeRenderObserveList: StoreValue[],
  run?: Run,
  storeRenderObserveMap?: StoreValue
) {
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

      execDependentCallbacks(storeRenderList, storeRenderObserveList, prop);

      return true;
    },
  });

  return result;
}

/**
 * 값 변경시 의존성이 있는 콜백을 찾아서 실행
 */
function execDependentCallbacks<T>(
  storeRenderList: Set<Run>,
  storeRenderObserveList: StoreValue[] = [],
  prop: keyof T
) {
  const trashCollections: Set<Run> = new Set();

  runWithtrashCollectUnit(storeRenderList).forEach(value =>
    trashCollections.add(value)
  );

  (storeRenderObserveList || []).forEach(storeRenderObserveMap => {
    const renderObserveList: Set<Run> =
      storeRenderObserveMap[prop] || new Set<Run>();

    runWithtrashCollectUnit(renderObserveList).forEach(value =>
      trashCollections.add(value)
    );

    removeTrashCollect(trashCollections, renderObserveList);
  });

  removeTrashCollect(trashCollections, storeRenderList);
}

/**
 * 의미 없어진 구독 콜백 제거
 */
function removeTrashCollect(trashCollections: Set<Run>, targetList: Set<Run>) {
  trashCollections.forEach(deleteTarget => {
    targetList.delete(deleteTarget);
  });
}

/**
 * 단발성 구독 함수는 한번 실행 하고 제거
 */
function runWithtrashCollectUnit(storeRenderList: Set<Run>) {
  const trashes: Run[] = [];
  storeRenderList.forEach(run => {
    if (run() === false) {
      trashes.push(run);
    }
  });
  return trashes;
}

/**
 * 구독이 처음 실행되면 abort 이벤트 수집하여 바인딩
 */
function runFirstEmit<T>(
  run: () => boolean | void | AbortSignal,
  storeRenderList: Set<Run>,
  storeRenderObserveMap: StoreValue,
  allowedAccessProp: Set<keyof T>
) {
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
}
