// Instrumented bundle only for the browser timing probe; never a package entry.
export * from '@/index';
export { hasPendingWork, setLowLaneBudget } from '@/scheduler';
export { useRenderBoundary } from '../../../helper/src/lifecycle/renderBoundary';
