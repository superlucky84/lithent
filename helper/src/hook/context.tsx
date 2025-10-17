import { h, Fragment, mount } from 'lithent';
import type { WDom, Renew } from 'lithent';
type ContextState<T> = { value: T };

const providerSymbol = Symbol('Provider');

type UseContextFn<T> = (context: any, renew: Renew) => ContextState<T>;

export function createContext<T>() {
  const Provider = mount<{
    state: ContextState<T>;
    [providerSymbol]?: boolean;
  }>((_renew, props, children: WDom[]) => {
    console.log('Provider');
    props[providerSymbol] = true;

    return () => <Fragment>{children}</Fragment>;
  });

  const useContext: UseContextFn<T> = (context, renew) => {
    console.log(renew);
    const cState = context.contextState;

    return cState;
  };

  const contextState = <T,>(
    value: T
  ): {
    value: T;
  } => {
    // const renews: Renew[] = [];
    let result = value;

    return {
      get value() {
        return result;
      },
      set value(newValue: T) {
        result = newValue;
      },
    };
  };

  return {
    Provider,
    contextState,
    useContext,
  };
}

const findProviderInParents = (wdom: WDom | undefined): WDom | null => {
  if (!wdom) return null;

  // Check if current node has provider symbol in compProps
  if (
    wdom.compProps &&
    (wdom.compProps as Record<symbol, unknown>)[providerSymbol]
  ) {
    return wdom;
  }

  const parent = wdom.getParent ? wdom.getParent() : undefined;
  return findProviderInParents(parent);
};

/*
export function createContext(defaultValue) {
  const subScripts = new Set();
  const reactiveValueKey = new symbol();
  let propKeyRef;

  const Provider = mount((renew, props, children) => {
    propKeyRef = props;
    props[reactiveValueKey] = props.value;

    const valueRef = state(props.value, () => {
      subScripts.forEach(callback => {
        callback();
      });
    });

    updateCallback(() => {
      subScripts.forEach(callback => {
        callback();
      });

      return () => {
        subScripts.clear();
      };
    }, [props[reactiveValueKey]]);
    return children;
  });

  const useContext = (contenxt, renew) => {
    if (contenxt.Provider === Provider) {
      contenxt.subscrips.add(renew);

      // 부모의 reactiveValue 르
      return findValue(cMap[propKeyRef], reactiveValueKey);
    } else {
      console.warn('not fuound provider');
      return null;
    }
  };

  return {
    Provider,
    useContext,
    subScripts,
  };
}
*/
