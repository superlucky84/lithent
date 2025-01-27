import type { WDom } from 'lithent';
import type { StateRefStore, Watch } from 'state-ref';
import { createStore } from 'state-ref';

export type RouteState = {
  page: string;
  destroy: (() => void) | string;
  renew: () => void;
  rVDom: WDom | null;
  loading: boolean;
};

export const routeWatch: Watch<RouteState> = createStore<RouteState>({
  page: '',
  destroy: '',
  renew: () => {},
  rVDom: null,
  loading: false,
});

export const routeRef: {
  info: StateRefStore<RouteState>;
  abortList: AbortController[];
} = {
  info: routeWatch(),
  abortList: [],
};
