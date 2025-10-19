import {
  h,
  Fragment,
  mount,
  getComponentKey,
  getComponentSubInfo,
  wdomCallback,
} from 'lithent';
import type { WDom, Renew } from 'lithent';

type ContextState<T> = {
  value: T;
  injectValue: (value: T) => void;
  addRenew: (value: (newValue: T) => boolean) => boolean;
};

const providerSymbol = Symbol('Provider');

type UseContextFn<T> = (
  context: any,
  renew: Renew,
  subscribeKeys?: string[]
) => T extends Record<string, any> ? T : ContextState<T>;

export function createContext<T>() {
  const Provider = mount<{
    [key: string]: ContextState<any>;
    [providerSymbol]?: any;
  }>((_renew, props, children: WDom[]) => {
    // Provider 식별자 저장
    props[providerSymbol] = true;

    return () => <Fragment>{children}</Fragment>;
  });

  const useContext: UseContextFn<T> = (context, renew, subscribeKeys?) => {
    const targetProvider = context.Provider;

    if (targetProvider !== Provider) {
      console.warn('not match provider form context');
      return undefined;
    }

    // useContext 호출 시점의 compKey 저장
    const myCompKey = getComponentKey();

    const cStateMap: Record<string, ContextState<any>> = {};
    const connectedKeys = new Set<string>();

    // 트리에서 Provider 찾기 (부모 방향으로 탐색)
    const findProviderInTree = (wdom?: WDom): any => {
      if (!wdom) {
        const vdRef = getComponentSubInfo(myCompKey, 'vd') as {
          value: WDom;
        } | null;
        return vdRef?.value ? findProviderInTree(vdRef.value) : null;
      }

      // Provider인지 확인
      if (
        wdom.compProps &&
        (wdom.compProps as Record<symbol, unknown>)[providerSymbol]
      ) {
        return wdom.compProps;
      }

      // 부모로 이동
      const parent = wdom.getParent?.();
      return parent ? findProviderInTree(parent) : null;
    };

    const createStateForKey = (key: string) => {
      let result: any;
      let renewlist: any[] = [];

      const cState = {
        get value() {
          return result;
        },
        set value(newValue: any) {
          result = newValue;
          if (renewlist.length) {
            renewlist = renewlist.filter(wrapRenew => wrapRenew(result));
          }
        },
        injectValue(newValue: any) {
          result = newValue;
        },
        addRenew(wrapRenew: (value: any) => boolean) {
          renewlist.push(wrapRenew);
          return true;
        },
      };

      cStateMap[key] = cState;
    };

    // WDom 트리 완성 후 Provider 찾아서 연결 (DOM 렌더링 전)
    wdomCallback(() => {
      const providerProps = findProviderInTree();

      if (providerProps) {
        const keysToConnect =
          subscribeKeys ||
          Object.keys(providerProps).filter(
            k =>
              typeof k === 'string' &&
              k !== 'children' &&
              providerProps[k] &&
              typeof providerProps[k].addRenew === 'function'
          );

        keysToConnect.forEach((key: string) => {
          if (!providerProps[key]) return;

          // state가 아직 없으면 생성
          if (!cStateMap[key]) {
            createStateForKey(key);
          }

          const cState = cStateMap[key];
          const originalState = providerProps[key];

          // 초기값 설정
          cState.injectValue(originalState.value);

          // 1. Provider → Consumer 동기화
          const wrapRenew = (newValue: any) => {
            cState.injectValue(newValue);
            return renew();
          };

          originalState.addRenew(wrapRenew);

          // 2. Consumer → Provider 동기화
          cState.addRenew((newValue: any) => {
            originalState.value = newValue;
            return true;
          });

          connectedKeys.add(key);
        });

        // 연결 후 renew 호출해서 초기값 표시
        renew();
      }
    });

    // subscribeKeys가 제공되면 해당 키만 state 생성
    if (subscribeKeys) {
      subscribeKeys.forEach(key => createStateForKey(key));
      return cStateMap as any;
    }

    // subscribeKeys가 없으면 Proxy로 동적 키 접근 처리
    return new Proxy(cStateMap, {
      get(target, prop: string) {
        if (prop in target) {
          return target[prop];
        }

        if (typeof prop === 'string') {
          createStateForKey(prop);
          return target[prop];
        }

        return undefined;
      },
    }) as any;
  };

  const contextState = <T,>(
    value: T
  ): {
    value: T;
    injectValue: (v: T) => void;
    addRenew: (wrapRenew: (value: T) => boolean) => boolean;
  } => {
    let result = value;
    let renewlist: any[] = [];

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

  return {
    Provider,
    contextState,
    useContext,
  };
}
