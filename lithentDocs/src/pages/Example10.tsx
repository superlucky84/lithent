import { CodeBlock } from '@/components/CodeBlock';
import { Example10 } from '@/components/examples/example10';
import type { Introduction } from '@/pages/Introduction';

const example10Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

const PizzaBuilder = mount(r => {
  const selectedToppings = state<string[]>(['pepperoni', 'mozzarella'], r);
  const size = state<'small' | 'medium' | 'large'>('medium', r);
  const crust = state<'thin' | 'regular' | 'thick'>('regular', r);

  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.v.includes(toppingId)) {
      selectedToppings.v = selectedToppings.v.filter(id => id !== toppingId);
    } else {
      selectedToppings.v = [...selectedToppings.v, toppingId];
    }
  };

  return () => (
    <>
      {/* Radio Buttons - Single Selection */}
      <input
        type="radio"
        name="size"
        value="small"
        checked={size.v === 'small'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Small

      <input
        type="radio"
        name="size"
        value="medium"
        checked={size.v === 'medium'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Medium

      {/* Checkboxes - Multiple Selection */}
      <input
        type="checkbox"
        value="pepperoni"
        checked={selectedToppings.v.includes('pepperoni')}
        onChange={() => toggleTopping('pepperoni')}
      /> Pepperoni

      <input
        type="checkbox"
        value="mushroom"
        checked={selectedToppings.v.includes('mushroom')}
        onChange={() => toggleTopping('mushroom')}
      /> Mushroom
    </>
  );
});
`;

export const Example10Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Checkbox & Radio Controls (Pizza Builder)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This interactive pizza builder demonstrates how{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input type="checkbox"&gt;
      </code>{' '}
      and{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input type="radio"&gt;
      </code>{' '}
      behave as controlled form elements.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        verify that Lithent correctly handles multi-select checkboxes and
        single-select radio groups while keeping the{' '}
        <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
          checked
        </code>{' '}
        attribute in sync with state
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can enable multiple toppings via checkboxes, while pizza size and
      crust are chosen via radio buttons. The total price and visual preview
      update in real time as you change selections.
    </p>

    <CodeBlock language="typescript" code={example10Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example10 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Core behavior of checkboxes
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Multi-select</strong>: multiple checkboxes can be selected at
          once.
        </li>
        <li>
          <strong>onChange events</strong>: handlers fire whenever a checkbox is
          toggled.
        </li>
        <li>
          <strong>checked attribute</strong>: determined by checking whether the
          value is included in the array.
        </li>
        <li>
          <strong>Array state management</strong>: selected values are stored in
          an array, updated immutably when adding/removing.
        </li>
        <li>
          <strong>value attribute</strong>: used to identify each checkbox
          uniquely.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Core behavior of radio buttons
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Single selection</strong>: only one radio with the same name
          can be selected.
        </li>
        <li>
          <strong>Grouping by name</strong>: the name attribute groups radios to
          enforce mutual exclusivity.
        </li>
        <li>
          <strong>onChange events</strong>: handlers run when the selected radio
          changes.
        </li>
        <li>
          <strong>checked attribute</strong>: computed by comparing the current
          state value with each radio&apos;s value.
        </li>
        <li>
          <strong>Auto uncheck</strong>: selecting a new radio automatically
          clears the previous one.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key features
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>17 toppings</strong>: organized into meat, veggie, cheese, and
          extras.
        </li>
        <li>
          <strong>5 presets</strong>: Pepperoni, Veggie, Meat Lovers, Hawaiian,
          Supreme.
        </li>
        <li>
          <strong>3 sizes</strong>: Small, Medium, Large (radio buttons).
        </li>
        <li>
          <strong>3 crusts</strong>: Thin, Regular, Thick (radio buttons).
        </li>
        <li>
          <strong>Live price calculation</strong>: base price plus topping
          prices.
        </li>
        <li>
          <strong>Nutrition info</strong>: shows total calories for selected
          toppings.
        </li>
        <li>
          <strong>Visual preview</strong>: emojis for toppings appear on the
          pizza.
        </li>
        <li>
          <strong>Clear All</strong>: unchecks all topping checkboxes.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          Select multiple topping checkboxes and ensure multi-select works
          correctly.
        </li>
        <li>Click checkboxes again to verify unchecking works properly.</li>
        <li>
          Change size with radios and confirm previous selections are cleared.
        </li>
        <li>
          Use preset buttons to select/unselect groups of toppings at once.
        </li>
        <li>
          Use Clear All to uncheck all toppings while preserving radio
          selections.
        </li>
        <li>
          Verify that price and calories update in real time as you change
          selections.
        </li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        🍕 Why a pizza builder?
      </h3>
      <p class="text-sm text-orange-700 dark:text-orange-300 mb-2">
        It&apos;s an intuitive way to understand the difference between
        checkboxes and radio buttons. Toppings can be multi-selected
        (checkboxes), while size and crust are single-choice (radios), mirroring
        real-world pizza ordering.
      </p>
      <p class="text-xs text-orange-600 dark:text-orange-400 italic">
        💡 Real pizza apps use similar patterns. This example doubles as both a
        form-control testbed and a practical UI pattern you can reuse.
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Checkbox vs radio button
      </h3>
      <div class="text-sm text-purple-700 dark:text-purple-300 space-y-2">
        <div>
          <strong>Checkbox</strong>: independent options. Each checkbox can be
          toggled on/off regardless of others and is typically stored in an
          array.
        </div>
        <div>
          <strong>Radio button</strong>: mutually exclusive options. Only one
          radio with the same <code>name</code> can be selected, and state is a
          single value.
        </div>
        <div class="text-xs text-purple-600 dark:text-purple-400 italic mt-2">
          💡 Tip: without a <code>name</code> attribute, radios aren&apos;t
          grouped and multiple can be selected. In this example,{' '}
          <code>name="size"</code> and <code>name="crust"</code> create two
          separate groups.
        </div>
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State guide
          </a>{' '}
          - Explains patterns for managing checkbox/radio selections as array
          and single-value state.
        </li>
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/props');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Props guide
          </a>{' '}
          - Covers how to work with form-related props like <code>checked</code>
          , <code>value</code>, and <code>name</code>.
        </li>
      </ul>
    </div>
  </div>
);
