export const createMetrics = () => ({
  created: 0,
  live: 0,
  draws: 0,
  childDraws: 0,
  childEffects: 0,
  activations: 0,
  timers: 0,
  subscriptions: 0,
  ticks: 0,
  externalEvents: 0,
  searchesStarted: 0,
  searchesAborted: 0,
  searchesFinished: 0,
  searchesCommitted: 0,
  savesStarted: 0,
  savesAborted: 0,
  savesFinished: 0,
  savesCommitted: 0,
});

export type EditorMetrics = ReturnType<typeof createMetrics>;
export interface DemoHandle {
  snapshot(): {
    core: 'base' | 'concurrent';
    plain: EditorMetrics;
    element: EditorMetrics;
  };
  emit(message: string): void;
  renewChild(host: 'plain' | 'element'): void;
}

declare global {
  interface Window {
    lifecycleDemo: DemoHandle;
  }
}
