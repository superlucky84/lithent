/**
 * Rerender시 실제 dom에 반영해줘야 하는 상태
 *
 * 1. (ADD). 가상돔 비교시 오리지날이 없으면 새로 추가되는 dom으로 판단한다.
 * 2. (REPLACE). 오리지날이 있고 같은 엘리먼트타입이 아닌 경우 해당 위치의 태그 자체를 교체해준다.
 * 3. (UPDATE). 오리지날이 있고 같은 타입이면 dom의 속성만 변경해 주며, 텍스트 노드일 경우는 텍스트를 교체해준다.
 * 4. (DELETE). 오리지날이 있고 새로운 엘리먼트 타입은 null타입일 경우 dom을 삭제한다.
 * 5. (SORTED-REPLACE). loop의 경우 REPLACE라도 키값에 의해 순서가 변경될 수 있으므로 새로운 dom을 단순히 기존 위치에 교체하지 않고 새로 삼입하여 정렬한다.
 * 6. (SORTED-UPDATE). loop의 경우 UPDATE라도 키값에 의해 순서가 변경될수 있으므로 재 삽입하여 정렬한다.
 * 7. (NONE). text타입의 경우 text가 같다면 변경이 필요 없으므로 방치한다. (Todo. 다른 타입의 경우 처리필요)
 */
import { WDom } from './types';
export declare const render: (wDom: WDom, wrapElement: HTMLElement | null, afterElement?: HTMLElement | null) => void;
export declare const wDomUpdate: (newWDomTree: WDom) => void;
export declare const recursiveRemoveEvent: (originalWDom: WDom) => void;
