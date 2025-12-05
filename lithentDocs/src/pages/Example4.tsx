import { CodeBlock } from '@/components/CodeBlock';
import { mount, ref } from 'lithent';
import { effect, state } from 'lithent/helper';
import type { Introduction } from '@/pages/Introduction';

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
    // 기존 컬러 로그들을 회색으로 변경
    ele.innerHTML = ele.innerHTML
      .replace(/text-green-400/g, 'text-gray-500')
      .replace(/text-orange-400/g, 'text-gray-500');
  };

  effect(
    () => {
      const ele = props.logEl.value as HTMLElement;
      // cleanup 직후가 아니면 기존 로그를 회색으로 (새로운 이벤트)
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
      // cleanup만 실행되는 경우를 대비해 타이머로 플래그 리셋
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
        count 변경 시 CLEAN_UP → INJECT가 실행되고, 컴포넌트 unmount 시
        CLEAN_UP만 실행됩니다.
      </p>
    </div>
  );
});

export const Example4Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Effect Helper
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        effect
      </code>
      훅으로 컴포넌트 생명주기에 따른 사이드 이펙트를 관리하는 예제입니다. 첫
      번째 인자는 mount/update 후 실행되는 액션, 두 번째 인자는 unmount/update
      전 실행되는 cleanup 함수입니다.
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
        관련 문서
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
        <li>
          <a
            href="/guide/effect"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/effect');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Effect 가이드
          </a>{' '}
          - effect 헬퍼의 forward/backward/dependencies 설계와 생명주기 연동
          방식을 자세히 설명합니다.
        </li>
        <li>
          <a
            href="/guide/mount-hooks"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/mount-hooks');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Mount Hooks 가이드
          </a>{' '}
          - effect의 내부 구현에 사용되는 mountCallback/mountReadyCallback
          흐름을 함께 이해할 수 있습니다.
        </li>
      </ul>
    </div>
  </div>
);
