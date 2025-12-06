import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Introduction = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Introduction
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent is a lightweight JavaScript library for building small,
      predictable pieces of UI.
      <br />
      It removes unnecessary magic or complex APIs so you can focus on a simple
      and fully predictable programming model.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Why does Lithent exist?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        Lightweight DOM manipulation in size-sensitive environments
      </strong>
      still needs a dependable library. Most frameworks are powerful, but they
      tend to be heavy for small projects or embedded widgets.
      <br />
      <br />
      Lithent was designed for that gap.{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        The Core package alone can drive a complete UI
      </strong>
      . When you need state management or a reactive system,{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        optional Helpers plug in like expansion packs
      </strong>
      without forcing new concepts on the project.
      <br />
      <br />
      Take only what you need so the stack can scale with the team, the product,
      and the runtime requirements.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      How do you use it?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent exposes two primary styles:{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Manual control
      </strong>
      과{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Declarative Light API mode
      </strong>
      . Mix and match both approaches inside the same project without friction.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Manual mode
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      State lives inside the most familiar JavaScript construct:{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        closures
      </strong>
      . Forget custom languages or hidden dependency tracking—you declare
      variables, mutate them, and the flow stays obvious and readable.
      <br />
      <br />
      Inside this transparent flow,
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        renew()
      </strong>
      simply asks Lithent to refresh the view. After mutating state, call
      renew() to update the UI—no hidden queues or implicit subscriptions.
      <br />
      <br />
      Pairing closures with this tiny API keeps updates 100% predictable and in
      your control. This is the natural developer experience Lithent optimizes
      for.
      <br />
      <br />
      Because there is no mandatory global state mechanism, the library stays
      slim and you stay in plain JavaScript.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Declarative Light API mode
    </h2>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This pattern automatically reflects state changes in the UI. The
      <code>lstate</code> API ships through loosely coupled helpers, so you only
      import it when the project actually needs it. Bring in state, context, and
      other helpers a la carte.
    </p>
    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Heads-up:
        </span>{' '}
        Stateless UI does not require mount or lmount—just write a plain
        function component in Lithent style (for example{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          ({'{ props, children }'})
        </code>
        is not necessary). A Lithent function component looks like{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          ({'{ title }'}, children)
        </code>
        . Read more in the{' '}
        <a
          href="/guide/stateless"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/stateless');
          }}
          class="text-[#42b883] hover:underline"
        >
          Stateless Components
        </a>{' '}
        section.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Gradual adoption
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Lithent can slot into almost any web stack:
    </p>
    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>Progressively enhance static HTML—no build step required</li>
      <li>Single-page applications (SPA)</li>
      <li>Server-side rendering (SSR)</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/quick-start"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/quick-start');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Quick start →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Now that you know the core philosophy, jump into the Quick Start guide
          to see Lithent in action.
        </p>
      </a>
    </div>
  </div>
);
