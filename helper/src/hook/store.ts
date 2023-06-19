/**
 * DataStore
 */
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
