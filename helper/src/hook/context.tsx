import { h, Fragment, mount } from 'lithent';
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
  const astack: any[] = [];

  /**
   * 프로바이더 사용 - 여러 state를 받을 수 있음
   */
  const Provider = mount<{
    [key: string]: ContextState<any>;
    [providerSymbol]?: boolean;
  }>((_renew, props, children: WDom[]) => {
    console.log('Provider');
    props[providerSymbol] = true;

    // astack에 쌓인 각 구독자 처리
    astack.forEach(
      ([
        setStateMap,
        renew,
        setOriginalRefMap,
        subscribeKeys,
        createStateForKey,
      ]) => {
        // subscribeKeys가 없으면 모든 키 구독 (providerSymbol 제외)
        const keysToSubscribe =
          subscribeKeys ||
          Object.keys(props).filter(
            k => typeof k === 'string' && k !== 'children'
          );

        keysToSubscribe.forEach((key: string) => {
          if (!props[key] || typeof props[key].addRenew !== 'function') {
            return; // ContextState가 아니면 스킵
          }

          // subscribeKeys가 null이면 동적으로 state 생성
          if (!setStateMap[key] && createStateForKey) {
            console.log('Creating state for key:', key);
            createStateForKey(key);
            console.log('After create, setStateMap[key]:', !!setStateMap[key]);
          }

          const wrapRenew = (newValue: any) => {
            if (setStateMap[key]) {
              setStateMap[key](newValue);
            }
            const isAlive = renew();
            return isAlive;
          };

          // 초기값 설정
          if (setStateMap[key]) {
            setStateMap[key](props[key].value);
          }
          if (setOriginalRefMap[key]) {
            setOriginalRefMap[key](props[key]);
          }

          // Provider의 state에 구독 등록
          props[key].addRenew(wrapRenew);
        });

        // 초기값이 설정되었으니 한 번 렌더링 트리거
        renew();
      }
    );
    astack.splice(0);

    return () => <Fragment>{children}</Fragment>;
  });

  /**
   * 컨텍스트 값 사용
   * @param subscribeKeys - 구독할 키 배열. 없으면 전체 구독
   */
  const useContext: UseContextFn<T> = (context, renew, subscribeKeys?) => {
    const targetProvider = context.Provider;

    if (targetProvider !== Provider) {
      console.warn('not match provider form context');
      return undefined;
    }

    // 다중 state 모드 (기본)
    const cStateMap: Record<string, ContextState<any>> = {};
    const setStateMap: Record<string, (v: any) => void> = {};
    const setOriginalRefMap: Record<string, (ref: ContextState<any>) => void> =
      {};

    // 동적으로 state 생성하는 함수
    const createStateForKey = (key: string) => {
      console.log('createStateForKey called for:', key);
      const cState = context.contextState();
      cStateMap[key] = cState;
      console.log('cStateMap after assignment:', cStateMap);

      setStateMap[key] = (injectState: any) => {
        console.log(
          'setState called for key:',
          key,
          'with value:',
          injectState
        );
        cState.injectValue(injectState);
      };

      setOriginalRefMap[key] = (originalRef: ContextState<any>) => {
        cState.addRenew((newValue: any) => {
          const result = (originalRef.value = newValue);
          return result !== undefined;
        });
      };
    };

    // subscribeKeys가 지정되어 있으면 미리 생성
    if (subscribeKeys) {
      subscribeKeys.forEach(key => createStateForKey(key));
    }

    // subscribeKeys를 null로 전달하면 Provider에서 모든 키 구독하며 동적 생성
    astack.push([
      setStateMap,
      renew,
      setOriginalRefMap,
      subscribeKeys || null,
      subscribeKeys ? null : createStateForKey,
    ]);

    return cStateMap as any;
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
