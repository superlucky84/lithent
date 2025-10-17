import { h, Fragment, mount } from 'lithent';
import type { WDom } from 'lithent';

export function createContext() {
  const Provider = mount((_renew, _props, children: WDom[]) => {
    console.log('ProviDer');

    return () => <Fragment>{children}</Fragment>;
  });

  const contextState = <T,>(
    value: T
  ): {
    value: T;
  } => {
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
  };
}

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
