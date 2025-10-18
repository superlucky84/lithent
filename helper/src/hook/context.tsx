import { h, Fragment, mount } from 'lithent';
import type { WDom, Renew } from 'lithent';
type ContextState<T> = {
  value: T;
  injectValue: (value: T) => void;
  addRenew: (value: (newValue: T) => boolean) => boolean;
};

const providerSymbol = Symbol('Provider');

type UseContextFn<T> = (context: any, renew: Renew) => ContextState<T>;

export function createContext<T>() {
  const astack: any[] = [];

  /**
   * 프로바이더 사용
   */
  const Provider = mount<{
    state: ContextState<T>;
    [providerSymbol]?: boolean;
  }>((_renew, props, children: WDom[]) => {
    console.log('Provider');
    props[providerSymbol] = true;

    astack.forEach(([setState, renew, setOriginalRef]) => {
      const wrapRenew = (newValue: T) => {
        setState(newValue);
        renew();
        return true;
      };
      setState(props.state.value);
      setOriginalRef(props.state);

      props.state.addRenew(wrapRenew);
    });
    astack.splice(0);

    return () => <Fragment>{children}</Fragment>;
  });

  /**
   * 컨텍스트 값 사용
   */
  const useContext: UseContextFn<T> = (context, renew) => {
    const targetProvider = context.Provider;
    let cState = context.contextState();

    if (targetProvider !== Provider) {
      console.warn('not match provider form context');
      return undefined;
    }

    const setState = (injectState: T) => {
      cState.injectValue(injectState);
    };
    const setOriginalRef = (originalRef: ContextState<T>) => {
      cState.addRenew((newValue: T) => {
        originalRef.value = newValue;
        return true;
      });
    };

    // 상태 업데이트 푸시
    astack.push([setState, renew, setOriginalRef]);

    return cState;
  };

  /**
   * 프로바이더에 사용할 컨텍스트 상태 생성
   */
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
          renewlist.forEach(wrapRenew => {
            wrapRenew(result);
          });
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
