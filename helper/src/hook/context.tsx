import {
  h,
  Fragment,
  mount,
  getComponentKey,
  getComponentSubInfo,
  mountReadyCallback,
} from 'lithent';
import type { WDom, Renew } from 'lithent';

type ContextState<T> = {
  value: T;
  injectValue: (value: T) => void;
  addRenew: (renewFn: (newValue: T) => boolean) => boolean;
};

type ProviderProps<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: ContextState<T[K]>;
      }
    : never;

type Context<T> = {
  Provider: ReturnType<typeof mount<ProviderProps<T>>>;
  contextState: typeof createContextState;
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
      // Provider 식별자 저장
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

    // useContext 호출 시점의 compKey 저장
    const myCompKey = getComponentKey();

    const cStateMap: Record<string, ContextState<unknown>> = {};

    const createStateForKey = (key: string) => {
      cStateMap[key] = createContextState();
    };

    // subscribeKeys가 제공되면 해당 키들에 대해 미리 state 생성
    if (subscribeKeys) {
      subscribeKeys.forEach(key => createStateForKey(key));
    }

    // 트리에서 Provider 찾기 (부모 방향으로 탐색)
    const findProviderInTree = (
      wdom?: WDom
    ): ProviderPropsInternal<T> | null => {
      if (!wdom) {
        const vdRef = getComponentSubInfo(myCompKey, 'vd') as {
          value: WDom;
        } | null;
        return vdRef?.value ? findProviderInTree(vdRef.value) : null;
      }

      // Provider인지 확인
      if (
        wdom.compProps &&
        (wdom.compProps as ProviderPropsInternal<T>)[providerSymbol]
      ) {
        return wdom.compProps as ProviderPropsInternal<T>;
      }

      // 부모로 이동
      const parent = wdom.getParent?.();
      return parent ? findProviderInTree(parent) : null;
    };

    // WDom 트리 완성 후 Provider 찾아서 연결 (DOM 렌더링 전)
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
              ).addRenew === 'function'
          );

        keysToConnect.forEach((key: string) => {
          // state가 아직 없으면 생성
          if (!cStateMap[key]) {
            createStateForKey(key);
          }

          const providerState = providerProps[
            key as keyof ProviderPropsInternal<T>
          ] as ContextState<unknown> | undefined;

          // Provider에 해당 키가 없으면 건너뛰기
          if (!providerState) return;

          const cState = cStateMap[key];

          // 초기값 설정
          cState.injectValue(providerState.value);

          // 1. Provider → Consumer 동기화
          const wrapRenew = (newValue: unknown) => {
            cState.injectValue(newValue);
            return renew();
          };

          providerState.addRenew(wrapRenew);

          // 2. Consumer → Provider 동기화
          cState.addRenew((newValue: unknown) => {
            providerState.value = newValue;
            return true;
          });
        });

        // 초기값이 채워졌으므로 renew() 호출하여 화면에 반영
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

const createContextState = <T,>(value?: T): ContextState<T> => {
  let result = value as T;
  let renewlist: Array<(value: T) => boolean> = [];

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
    injectValue(newValue: T) {
      result = newValue;
    },
    addRenew(wrapRenew: (value: T) => boolean) {
      renewlist.push(wrapRenew);
      return true;
    },
  };
};
