import * as core from 'lithent';
import { h, mount, render } from 'lithent';
import { defineElement } from '../../../element/src';
import { createRetainedHost, supportsRenderBoundary } from 'lithent/helper';
import { createEditor } from './editor';
import { createMetrics } from './metrics';
import { emitStatus } from './status';
import './style.css';
import './widget.css';
import widgetStyles from './widget.css?inline';

declare const __LITHENT_CORE__: 'base' | 'concurrent';
if ('deferRender' in core !== (__LITHENT_CORE__ === 'concurrent'))
  throw new Error(`Wrong core: expected ${__LITHENT_CORE__}`);
document.documentElement.dataset.core = __LITHENT_CORE__;
document.querySelector('#core')!.textContent = __LITHENT_CORE__;
const freezeChildren = __LITHENT_CORE__ === 'concurrent';
if (supportsRenderBoundary() !== freezeChildren)
  throw new Error(`Wrong render boundary capability: ${__LITHENT_CORE__}`);
document.documentElement.dataset.freezeChildren = String(freezeChildren);

const plainMetrics = createMetrics();
const elementMetrics = createMetrics();
const displayMetrics = (
  id: string,
  metrics: ReturnType<typeof createMetrics>
) => {
  document.querySelector(id)!.textContent = JSON.stringify(metrics, null, 2);
};
const PlainHost = createRetainedHost(
  createEditor(plainMetrics, () =>
    displayMetrics('#plain-metrics', plainMetrics)
  ),
  console.error,
  { freezeChildren }
);
const ElementHost = createRetainedHost(
  createEditor(elementMetrics, () =>
    displayMetrics('#element-metrics', elementMetrics)
  ),
  console.error,
  { freezeChildren }
);
defineElement('closure-editor', ElementHost, {
  props: { active: Boolean },
  styles: [widgetStyles],
});

let plainActive = true;
let plainRenew = () => false;
const Parent = mount(renew => {
  plainRenew = renew;
  return () => h(PlainHost, { active: plainActive });
});
let destroyPlain: (() => void) | undefined;
const connectPlain = () => {
  if (destroyPlain) return;
  plainActive = true;
  destroyPlain = render(
    h(Parent, {}),
    document.querySelector<HTMLElement>('#plain-root')!
  );
};
connectPlain();

const element = document.querySelector<HTMLElement & { active: boolean }>(
  '#element-widget'
)!;
const button = (id: string) => document.querySelector<HTMLButtonElement>(id)!;
const refresh = () => {
  button('#plain-toggle').disabled = !destroyPlain;
  button('#plain-toggle').textContent = plainActive ? '숨기기' : '다시 열기';
  button('#plain-remove').disabled = !destroyPlain;
  button('#plain-connect').disabled = !!destroyPlain;
  for (const id of ['#element-toggle', '#element-remove', '#element-move'])
    button(id).disabled = !element.isConnected;
  button('#element-toggle').textContent = element.active
    ? '숨기기'
    : '다시 열기';
  button('#element-connect').disabled = element.isConnected;
};
button('#plain-toggle').onclick = () => {
  plainActive = !plainActive;
  plainRenew();
  refresh();
};
button('#plain-remove').onclick = () => {
  destroyPlain?.();
  destroyPlain = undefined;
  plainRenew = () => false;
  refresh();
};
button('#plain-connect').onclick = () => {
  connectPlain();
  refresh();
};
button('#element-toggle').onclick = () => {
  element.active = !element.active;
  refresh();
};
button('#element-remove').onclick = () => {
  element.remove();
  refresh();
};
button('#element-connect').onclick = () => {
  document.querySelector('#element-slot-a')!.appendChild(element);
  refresh();
};
button('#element-move').onclick = () => {
  const target =
    element.parentElement?.id === 'element-slot-a'
      ? '#element-slot-b'
      : '#element-slot-a';
  element.remove();
  document.querySelector(target)!.appendChild(element);
  refresh();
};
let message = 0;
button('#emit').onclick = () =>
  window.lifecycleDemo.emit(`외부 알림 ${++message}`);
window.lifecycleDemo = {
  snapshot: () => ({
    core: __LITHENT_CORE__,
    plain: { ...plainMetrics },
    element: { ...elementMetrics },
  }),
  emit: emitStatus,
  renewChild: host => {
    window.dispatchEvent(
      new CustomEvent('closure-demo-child', {
        detail: host === 'plain' ? plainMetrics : elementMetrics,
      })
    );
  },
};
refresh();
// The host creates its nested view after the committed mount queue.
queueMicrotask(() => {
  document.documentElement.dataset.ready = 'true';
});
