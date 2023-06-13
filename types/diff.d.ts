/**
 * 변경점의 컴포넌트로 부터 기존트리와 상태를 비교하며 새로 가상돔 트리를 새로 만든다.
 * (오리지널 가상돔으로 부터 유의미한 상태를 유지해야 하는 경우를 판별하여 새로운 트리를 만듬)
 *
 * 1. 동일한 트리의 위치해 있고 오리지널과 컴포넌트의 타입이 같은경우 기존 상태를 계승한다.
 * 2. 동일한 컴포넌트가 아니라고 판단되는 경우에는 기존 상태를 무시하는 새로운 트리를 생성한다.
 * 3. fragment타입의 경우에는 children의 갯수까지 같아야지 같은 타입이라고 판단한다.
 * 4. loop타입의 자식들은 같은 키값을 가졌는지로 동일한지 판단하며 키값이 없을경우 fragment타입처럼 취급한다.
 */
import { WDom, TagFunctionResolver } from './types';
export declare const makeNewWDomTree: ({ originalWDom, newWDom, }: {
    originalWDom?: WDom | undefined;
    newWDom: WDom | TagFunctionResolver;
}) => WDom;
