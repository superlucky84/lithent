import {
  h,
  Fragment,
  mount,
  getComponentKey,
  getComponentSubInfo,
  mountReadyCallback,
} from 'lithent';
import type { WDom, Renew } from 'lithent';

const INJECT = Symbol('INJECT');
const ADDRENEW = Symbol('ADDRENEW');

export type ContextState<T> = {
  value: T;
  [INJECT]: (value: T) => void;
  [ADDRENEW]: (renewFn: (newValue: T) => boolean) => boolean;
};

export type ProviderProps<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: ContextState<T[K]>;
      }
    : never;

export type Context<T> = {
  Provider: ReturnType<typeof mount<ProviderProps<T>>>;
  contextState: <V>(value?: V, renew?: Renew) => ContextState<V>;
  useContext: (
    context: Context<T>,
    renew: Renew,
    subscribeKeys?: string[]
  ) => T extends Record<string, unknown> ? ProviderProps<T> : ContextState<T>;
};

const providerSymbol = Symbol('Provider');

type ProviderPropsInternal<T> = ProviderProps<T> & {
  [providerSymbol]?: boolean;
};

export function createContext<T>(): Context<T> {
  const Provider = mount<ProviderPropsInternal<T>>(
    (_renew, props, children: WDom[]) => {
      // Store Provider identifier
      props[providerSymbol] = true;

      return () => <Fragment>{children}</Fragment>;
    }
  );

  const useContext = (
    context: Context<T>,
    renew: Renew,
    subscribeKeys?: string[]
  ) => {
    const targetProvider = context.Provider;

    if (targetProvider !== Provider) {
      throw new Error('Context mismatch: Provider does not match');
    }

    // Store compKey at the time of useContext call
    const myCompKey = getComponentKey();

    const cStateMap: Record<string, ContextState<unknown>> = {};

    const createStateForKey = (key: string) => {
      cStateMap[key] = createContextState();
    };

    // If subscribeKeys are provided, create states for those keys in advance
    if (subscribeKeys) {
      subscribeKeys.forEach(key => createStateForKey(key));
    }

    // Find Provider in tree (search towards parent)
    const findProviderInTree = (
      wdom?: WDom
    ): ProviderPropsInternal<T> | null => {
      if (!wdom) {
        if (!myCompKey) return null;
        const vdRef = getComponentSubInfo(myCompKey, 'vd') as {
          value: WDom;
        } | null;
        return vdRef?.value ? findProviderInTree(vdRef.value) : null;
      }

      // Check if it's a Provider
      if (
        wdom.compProps &&
        (wdom.compProps as ProviderPropsInternal<T>)[providerSymbol]
      ) {
        return wdom.compProps as ProviderPropsInternal<T>;
      }

      // Move to parent
      const parent = wdom.getParent?.();
      return parent ? findProviderInTree(parent) : null;
    };

    // Find and connect to Provider after WDom tree is complete (before DOM rendering)
    mountReadyCallback(() => {
      const providerProps = findProviderInTree();

      if (providerProps) {
        const keysToConnect =
          subscribeKeys ||
          Object.keys(providerProps).filter(
            k =>
              typeof k === 'string' &&
              k !== 'children' &&
              providerProps[k as keyof ProviderPropsInternal<T>] &&
              typeof (
                providerProps[
                  k as keyof ProviderPropsInternal<T>
                ] as ContextState<unknown>
              )[ADDRENEW] === 'function'
          );

        keysToConnect.forEach((key: string) => {
          // Create state if it doesn't exist yet
          if (!cStateMap[key]) {
            createStateForKey(key);
          }

          const providerState = providerProps[
            key as keyof ProviderPropsInternal<T>
          ] as ContextState<unknown> | undefined;

          // Skip if Provider doesn't have this key
          if (!providerState) return;

          const cState = cStateMap[key];

          // Set initial value
          cState[INJECT](providerState.value);

          // 1. Synchronize Provider → Consumer
          const wrapRenew = (newValue: unknown) => {
            cState[INJECT](newValue);
            return renew();
          };

          providerState[ADDRENEW](wrapRenew);

          // 2. Synchronize Consumer → Provider
          cState[ADDRENEW]((newValue: unknown) => {
            providerState.value = newValue;
            return true;
          });
        });

        // Initial values are filled, so call renew() to reflect on screen
        renew();
      }
    });

    return cStateMap as T extends Record<string, unknown>
      ? ProviderProps<T>
      : ContextState<T>;
  };

  return {
    Provider,
    contextState: createContextState,
    useContext,
  };
}

const createContextState = <T,>(value?: T, renew?: Renew): ContextState<T> => {
  let result = value as T;
  let renewlist: Array<(value: T) => boolean> = [];

  // If renew is provided, add it to renewlist by default
  if (renew) {
    renewlist.push(() => {
      return renew();
    });
  }

  return {
    get value() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      if (renewlist.length) {
        renewlist = renewlist.filter(wrapRenew => wrapRenew(result));
      }
    },
    [INJECT](newValue: T) {
      result = newValue;
    },
    [ADDRENEW](wrapRenew: (value: T) => boolean) {
      renewlist.push(wrapRenew);
      return true;
    },
  };
};
