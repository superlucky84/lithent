import { WDom } from './index';
type Param<A, B, C> = {
    state: A;
    props: C;
    values: B;
    children: WDom[];
};
export default function make<A extends {}, B extends {}, C>({ signal, makePrivates, makeCallbacks, makeComponent, }: {
    signal: A;
    makePrivates: (info: Omit<Param<A, B, C>, 'children'>) => B;
    makeCallbacks?: (info: Param<A, B, C>) => {
        mountedCallback: () => void;
        updatedCallback: () => [() => void, unknown[]];
        unmountCallback: () => void;
    };
    makeComponent: (info: Param<A, B, C>) => WDom;
}): (props: C, children: WDom[]) => () => WDom;
export {};
