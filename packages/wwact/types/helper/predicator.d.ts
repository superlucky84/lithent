import { WDom, TagFunction, TagFunctionResolver, FragmentFunction, WDomType } from '../types';
type DiffParam = {
    originalWDom?: WDom;
    newWDom: WDom | TagFunction | TagFunctionResolver;
};
type WDomParam = string | WDom | TagFunction | TagFunctionResolver | FragmentFunction;
export declare function getWDomType(wDom: WDom | TagFunction | TagFunctionResolver): WDomType | undefined;
export declare const checkSameWDomWithOriginal: {
    component: typeof checkSameCustomComponent;
    loop: typeof checkNormalTypeElement;
    text: typeof checkNormalTypeElement;
    element: typeof checkSameTagElement;
    fragment: typeof checkSameFragment;
    empty: typeof checkNormalTypeElement;
};
/**
 * Predicator
 */
export declare function checkCustemComponentFunction(target: WDomParam): target is TagFunction | TagFunctionResolver;
export declare function checkFragmentFunction(target: unknown): target is FragmentFunction;
export declare function checkPlainWDomType(wDom: WDomParam): wDom is WDom;
export declare function checkPlainType(wDom: WDomParam, typeName: string): boolean;
export declare function checkEmptyElement(wDom: WDomParam): boolean;
export declare function checkSameCustomComponent({ originalWDom, newWDom }: DiffParam): boolean;
export declare function checkSameFragment({ originalWDom, newWDom }: DiffParam): boolean;
export declare function checkSameTagElement({ originalWDom, newWDom }: DiffParam): boolean;
export declare function checkNormalTypeElement({ originalWDom, newWDom }: DiffParam): boolean;
export declare function checkExisty(value: unknown): boolean;
export declare function checkFunction(target: unknown): target is Function;
export declare function checkStyleData(dataKey: string, dataValue: unknown): dataValue is Record<string, string>;
export declare function checkRefData(dataKey: string, dataValue: unknown): dataValue is {
    value: HTMLElement | DocumentFragment | Text | undefined;
};
export declare function checkNormalAttribute(dataValue: unknown): dataValue is number | string;
export {};
