/**
 * DataStore
 */
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
