/**
 * DataStore
 */
// const storeGroup: { [key: string]: UseDataStoreValue } = {};
const storeGroup = new Map<string | symbol, unknown>();
const dataStoreRenderQueue: {
  [key: string | symbol]: (() => boolean)[];
} = {};

export const store = <T extends {}>(value: T) => {
  const storeKey = Symbol();
  storeGroup.set(storeKey, value);

  return (renew: () => boolean) => {
    dataStoreRenderQueue[storeKey] ??= [];
    dataStoreRenderQueue[storeKey].push(renew);

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
      const dataStoreQueue = dataStoreRenderQueue[storeKey];
      const trashCollections: (() => boolean)[] = [];

      dataStoreQueue.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      trashCollections.forEach(deleteTarget =>
        dataStoreQueue.splice(dataStoreQueue.indexOf(deleteTarget), 1)
      );

      return true;
    },
  });
