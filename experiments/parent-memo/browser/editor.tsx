import * as core from 'lithent';
import type { CompKey, Renew } from 'lithent';

const {
  h,
  mount,
  mountCallback,
  render,
  getComponentKey,
  getComponentSubInfo,
  nextTick,
} = core;
const feature = ['use', 'Parent', 'Memo'].join('');
const memoHook = (core as unknown as Record<string, typeof core.useParentMemo>)[
  feature
];

type Field = { id: number; label: string; version: number };
type FieldProps = { field: Field; disabled: boolean; key?: number };

const createEditor = (count: number, optIn: boolean) => {
  if (optIn && typeof memoHook !== 'function')
    throw Error('Parent memo is unavailable');
  let fields: Field[] = Array.from({ length: count }, (_, id) => ({
    id,
    label: `Field ${id}`,
    version: 0,
  }));
  let host: HTMLElement | undefined = document.createElement('main');
  document.body.append(host);
  let parent: Renew = () => false;
  let dispose: (() => void) | undefined;
  const keys: CompKey[] = [];
  let references: WeakRef<object>[] = [];
  const metrics = { renders: 0, mounts: 0, unmounts: 0 };

  const Input = mount<FieldProps>((renew, props) => {
    keys.push(getComponentKey()!);
    if (optIn)
      memoHook<FieldProps>(next => [
        next.field.label,
        next.field.version,
        next.disabled,
      ]);
    let draft = '';
    mountCallback(() => {
      metrics.mounts++;
      return () => {
        metrics.unmounts++;
      };
    });
    return () => {
      metrics.renders++;
      return (
        <label data-id={props.field.id}>
          <span>{props.field.label}</span>
          <input
            disabled={props.disabled}
            value={draft}
            onInput={(event: Event) => {
              draft = (event.target as HTMLInputElement).value;
              renew();
            }}
          />
        </label>
      );
    };
  });
  const Editor = mount(renew => {
    parent = renew;
    return () => (
      <form>
        {fields.map(field => (
          <Input key={field.id} field={field} disabled={false} />
        ))}
      </form>
    );
  });
  dispose = render(<Editor />, host);
  const input = (id: number) =>
    host!.querySelector<HTMLInputElement>(`label[data-id="${id}"] input`)!;

  return {
    metrics,
    input,
    refresh: async () => {
      parent();
      await nextTick();
    },
    edit: async (id: number, value: string) => {
      const element = input(id);
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await nextTick();
    },
    reverse: async () => {
      fields.reverse();
      parent();
      await nextTick();
    },
    rename: async (id: number, label: string) => {
      const field = fields.find(field => field.id === id)!;
      field.label = label;
      field.version++;
      parent();
      await nextTick();
    },
    remove: async (id: number) => {
      fields = fields.filter(field => field.id !== id);
      parent();
      await nextTick();
    },
    destroy: () => {
      references = keys.flatMap(key => {
        const node = getComponentSubInfo(key, 'vd')?.value;
        return node ? [new WeakRef<object>(node)] : [];
      });
      references.push(new WeakRef<object>(host!));
      dispose!();
      dispose = undefined;
      host!.remove();
      host = undefined;
      fields = [];
    },
    retention: () => ({
      retainedKeys: keys.length,
      registered: keys.filter(key => !!getComponentSubInfo(key, 'vd')).length,
      retainedOutputsAndHost: references.filter(
        reference => !!reference.deref()
      ).length,
      unmounts: metrics.unmounts,
    }),
  };
};

declare global {
  interface Window {
    bootEditor: typeof createEditor;
    editor: ReturnType<typeof createEditor>;
  }
}
window.bootEditor = createEditor;
