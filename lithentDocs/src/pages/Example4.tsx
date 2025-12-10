import { CodeBlock } from '@/components/CodeBlock';
import { mount, ref } from 'lithent';
import { effect, state } from 'lithent/helper';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

const example4Code = `import { mount, render, ref } from 'lithent';
import { state, effect } from 'lithent/helper';

const Children = mount((renew) => {
  const count = state<number>(0, renew);
  const change = () => {
    count.v += 1;
  };

  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN UP'),
    () => [count.v]
  );

  return () => (
    <>
      <button onClick={change} type="button">
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});

const Parent = mount(renew => {
  let mountState = true;
  const toggleMount = () => {
    mountState = !mountState;
    renew();
  };

  return () => (
    <>
      <button onClick={toggleMount} type="button">
        toggleMount
      </button>
      {mountState ? <Children /> : null}
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const Children = mount<{ logEl: { value: HTMLElement | null } }>((r, props) => {
  const count = state<number>(0, r);
  const change = () => {
    count.v += 1;
  };

  let cleanupJustRan = false;

  const scrollToBottom = (ele: HTMLElement) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const parent = ele.parentElement;
        if (parent) {
          parent.scrollTop = parent.scrollHeight;
        }
      });
    });
  };

  const fadeOldLogs = (ele: HTMLElement) => {
    // Turn previous colored logs into gray
    ele.innerHTML = ele.innerHTML
      .replace(/text-green-400/g, 'text-gray-500')
      .replace(/text-orange-400/g, 'text-gray-500');
  };

  effect(
    () => {
      const ele = props.logEl.value as HTMLElement;
      // For new events, fade old logs to gray unless we just ran cleanup
      if (!cleanupJustRan) {
        fadeOldLogs(ele);
      }
      cleanupJustRan = false;
      ele.innerHTML += '<span class="text-green-400">INJECT</span><br>';
      ele.innerHTML +=
        '<div class="my-2 border-t border-gray-500 opacity-30"></div>';
      scrollToBottom(ele);
    },
    () => {
      const ele = props.logEl.value as HTMLElement;
      fadeOldLogs(ele);
      cleanupJustRan = true;
      // Reset the flag on the next tick in case only cleanup ran
      setTimeout(() => {
        cleanupJustRan = false;
      }, 0);
      ele.innerHTML += '<span class="text-orange-400">CLEAN_UP</span><br>';
      ele.innerHTML +=
        '<div class="my-2 border-t border-gray-500 opacity-30"></div>';
      scrollToBottom(ele);
    },
    () => [count.v]
  );

  return () => (
    <div class="flex items-center gap-3">
      <button
        onClick={change}
        type="button"
        class="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#42b883] hover:bg-[#36996b] transition-colors"
      >
        increase
      </button>
      <span class="text-sm text-gray-800 dark:text-gray-200">
        count: <strong class="text-[#42b883]">{count.v}</strong>
      </span>
    </div>
  );
});

const Example4Preview = mount(renew => {
  let logEl = ref(null);
  let mountState = true;
  const toggleMount = () => {
    mountState = !mountState;
    renew();
  };

  return () => (
    <div class="flex flex-col gap-3">
      <div class="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 h-40 overflow-y-auto text-xs font-mono">
        <div ref={logEl} class="text-gray-700 dark:text-gray-300"></div>
      </div>
      <div class="flex items-center gap-3 min-h-[70px]">
        <button
          onClick={toggleMount}
          type="button"
          class="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {mountState ? 'Unmount Child' : 'Mount Child'}
        </button>
        {mountState ? <Children logEl={logEl} /> : null}
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        When the count changes, <code>CLEAN_UP</code> runs first and then{' '}
        <code>INJECT</code>. When the component unmounts, only{' '}
        <code>CLEAN_UP</code> runs.
      </p>
    </div>
  );
});

export const Example4Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Effect helper
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This example shows how to manage side effects with the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        effect
      </code>{' '}
      helper across the component lifecycle. The first argument runs after
      mount/update, and the second argument runs as a cleanup before unmount or
      before the next update.
    </p>

    <CodeBlock language="typescript" code={example4Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example4Preview />
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
        <li>
          <a
            href="/guide/effect"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/effect');
            }}
          >
            Effect guide
          </a>{' '}
          - Explains the forward/backward/dependencies design of the{' '}
          <code>effect</code> helper and how it ties into the lifecycle.
        </li>
        <li>
          <a
            href="/guide/mount-hooks"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/mount-hooks');
            }}
          >
            Mount Hooks guide
          </a>{' '}
          - Helps you understand the <code>mountCallback</code> and{' '}
          <code>mountReadyCallback</code> flow used internally by{' '}
          <code>effect</code>.
        </li>
      </ul>
    </div>
  </div>
);
