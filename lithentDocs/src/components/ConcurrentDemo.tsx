import { mount, mountCallback, ref } from 'lithent';
import * as concurrent from 'lithent-concurrent';

// The docs may use either core. Give this demo its own concurrent renderer and
// use its h() so no component registry or Fragment is shared with the host app.
export const ConcurrentDemo = mount<{ language: 'en' | 'ko' }>(
  (_renew, props) => {
    const host = ref<HTMLDivElement | null>(null);
    mountCallback(() => {
      if (!host.value) return;
      const target = host.value;
      let alive = true;
      let write = (_value: string) => {};
      let pending = () => false;
      const ko = props.language === 'ko';
      const { h } = concurrent;

      const List = concurrent.mount(renew => {
        const key = concurrent.getComponentKey();
        let value = 'initial';
        pending = () => !!key && concurrent.hasPending(key, 'low');
        write = next => {
          value = next;
          concurrent.deferRender(renew);
        };
        return () =>
          h(
            'ul',
            {
              class: 'max-h-48 overflow-auto text-sm space-y-1',
              'data-demo-rows': '',
            },
            Array.from({ length: 300 }, (_, i) =>
              h('li', { key: i }, `${value}:${i}`)
            )
          );
      });

      const Input = concurrent.mount(renew => {
        let query = '';
        let status = 'idle';
        let afterTick = '';
        let afterIdle = '';
        let revision = 0;
        const change = async (event: Event) => {
          const current = ++revision;
          query = (event.target as HTMLInputElement).value;
          write(query);
          status = pending() ? 'pending' : 'idle';
          renew();
          await concurrent.nextTick();
          if (!alive || current !== revision) return;
          afterTick = target.querySelector('li')?.textContent || '';
          await concurrent.whenIdle();
          if (!alive || current !== revision) return;
          afterIdle = target.querySelector('li')?.textContent || '';
          status = 'idle';
          renew();
        };
        return () =>
          h(
            'div',
            { class: 'space-y-3 mb-4' },
            h(
              'label',
              { class: 'block' },
              ko ? '검색어' : 'Query',
              h('input', {
                class: 'block w-full mt-2 p-2 rounded border dark:bg-gray-800',
                placeholder: ko
                  ? '미룬 목록을 갱신해 보세요'
                  : 'Update the deferred list',
                value: query,
                onInput: change,
              })
            ),
            h(
              'p',
              {},
              ko ? '입력: ' : 'Input: ',
              h('output', { 'data-demo-query': '' }, query)
            ),
            h(
              'p',
              {},
              'pending: ',
              h('output', { 'data-demo-status': '' }, status)
            ),
            h(
              'p',
              {},
              'nextTick: ',
              h('output', { 'data-demo-tick': '' }, afterTick)
            ),
            h(
              'p',
              {},
              'whenIdle: ',
              h('output', { 'data-demo-idle': '' }, afterIdle)
            )
          );
      });
      const App = concurrent.mount(
        () => () => h('section', {}, h(Input, {}), h(List, {}))
      );
      const destroy = concurrent.render(h(App, {}), target);
      target.dataset.runtime = 'concurrent';
      return () => {
        alive = false;
        destroy();
      };
    });
    return () => (
      <div
        ref={host}
        data-concurrent-demo
        class="p-5 my-6 rounded-lg border border-[#42b883] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
      />
    );
  }
);
