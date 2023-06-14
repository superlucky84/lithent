export type UseDataStoreValue = { [key: string | symbol]: unknown };

/**
 * DataStore
 */
export const dataStoreStore: { [key: string]: UseDataStoreValue } = {};
export const dataStoreRenderQueue: {
  [key: string]: (() => boolean)[];
} = {};
