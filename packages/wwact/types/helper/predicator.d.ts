import { WDom, TagFunction, TagFunctionResolver, FragmentFunction, WDomType } from '../types';
type DiffParam = {
    originalWDom?: WDom;
    newWDom: WDom | TagFunction | TagFunctionResolver;
};
type WDomParam = string | WDom | TagFunction | TagFunctionResolver | FragmentFunction;
/**
 * Predicator
 */
export declare const checkCustemComponentFunction: (target: WDomParam) => target is TagFunctionResolver | TagFunction;
export declare const checkFragmentFunction: (target: unknown) => target is FragmentFunction;
export declare const checkPlainWDomType: (wDom: WDomParam) => wDom is WDom;
export declare const checkPlainType: (wDom: WDomParam, typeName: string) => boolean;
export declare const checkEmptyElement: (wDom: WDomParam) => boolean;
export declare const checkSameCustomComponent: ({ originalWDom, newWDom, }: DiffParam) => boolean;
export declare const checkSameFragment: ({ originalWDom, newWDom }: DiffParam) => boolean;
export declare const checkSameTagElement: ({ originalWDom, newWDom }: DiffParam) => boolean;
export declare const checkNormalTypeElement: ({ originalWDom, newWDom }: DiffParam) => boolean;
export declare const checkExisty: (value: unknown) => boolean;
export declare const checkFunction: (target: unknown) => target is Function;
export declare const checkStyleData: (dataKey: string, dataValue: unknown) => dataValue is Record<string, string>;
export declare const checkRefData: (dataKey: string, dataValue: unknown) => dataValue is {
    value: HTMLElement | DocumentFragment | Text | undefined;
};
export declare const checkNormalAttribute: (dataValue: unknown) => dataValue is string | number;
export declare const getWDomType: (wDom: WDom | TagFunction | TagFunctionResolver) => WDomType | undefined;
export declare const checkSameWDomWithOriginal: {
    component: ({ originalWDom, newWDom, }: DiffParam) => boolean;
    loop: ({ originalWDom, newWDom }: DiffParam) => boolean;
    text: ({ originalWDom, newWDom }: DiffParam) => boolean;
    element: ({ originalWDom, newWDom }: DiffParam) => boolean;
    fragment: ({ originalWDom, newWDom }: DiffParam) => boolean;
    empty: ({ originalWDom, newWDom }: DiffParam) => boolean;
};
export {};
