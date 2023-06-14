/**
 * DataStore
 */
// const storeGroup: { [key: string]: UseDataStoreValue } = {};
const storeGroup = new Map<string | symbol, unknown>();
const dataStoreRenderQueue: {
  [key: string | symbol]: (() => boolean)[];
} = {};

export const makeStore = <T extends {}>(
  value: T,
  {
    storeKey = Symbol(),
    renew,
  }: {
    storeKey?: string | symbol;
    renew?: () => boolean;
  } = {}
) => {
  storeGroup.set(storeKey, value);

  if (renew) {
    dataStoreRenderQueue[storeKey] ??= [];
    dataStoreRenderQueue[storeKey].push(renew);
  }

  return updater<T>(storeKey);
};

export const subscribeStore = <T extends {}>(
  storeKey: string | symbol,
  renew: () => boolean
) => {
  const store = storeGroup.get(storeKey);
  if (!store) {
    throw new Error(`store is not exist`);
  }

  dataStoreRenderQueue[storeKey].push(renew);

  return updater<T>(storeKey);
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
