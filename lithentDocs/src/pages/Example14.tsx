import { mount } from 'lithent';
import { Example14 } from '@/components/examples/example14';
import { CodeBlock } from '@/components/CodeBlock';

export const Example14Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Nested Component Unmount Callbacks
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example tests the execution order of <code>mountCallback</code>{' '}
        cleanup functions in a nested component tree. You can verify how cleanup
        propagates from parent to children when the tree unmounts.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key idea
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nested unmount callbacks</strong>: when a parent component
          unmounts, all child components&apos; cleanup functions should run in a
          predictable order. This is crucial for preventing memory leaks and
          releasing resources safely.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Component structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        The example models a game inventory system with 3 levels of nesting:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Depth 1 (Inventory)</strong>: the overall inventory system –
          logs &quot;🎒 Inventory system initialized/shutdown&quot;
        </li>
        <li>
          <strong>Depth 2 (InventoryCategory)</strong>: weapon/armor/potion
          categories – logs &quot;📂 Category opened/closed&quot;
        </li>
        <li>
          <strong>Depth 3 (ItemSlot)</strong>: individual items (8 total) – logs
          &quot;📦 Item equipped/unequipped&quot;
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code example
      </h2>

      <CodeBlock
        code={`// Depth 3: individual item component
const ItemSlot = mount<{
  item: Item;
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📦 \${props.item.name} equipped</span><br>\`;
    }

    // cleanup function: runs on unmount
    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>❌ \${props.item.name} unequipped</span><br>\`;
      }
    };
  });

  return () => (
    <div class="flex items-center gap-2 p-2 rounded border">
      <span class="text-2xl">{props.item.icon}</span>
      <span class="text-xs">{props.item.name}</span>
    </div>
  );
});

// Depth 2: category component
const InventoryCategory = mount<{
  title: string;
  items: Item[];
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📂 \${props.title} category opened</span><br>\`;
    }

    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🗂️ \${props.title} category closed</span><br>\`;
      }
    };
  });

  return () => (
    <div>
      <h4>{props.title}</h4>
      {props.items.map(item => (
        <ItemSlot key={item.id} item={item} logEl={props.logEl} />
      ))}
    </div>
  );
});

// Depth 1: inventory component
const Inventory = mount<{ logEl: { value: HTMLElement | null } }>(
  (_r, props) => {
    mountCallback(() => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🎒 Inventory system initialized</span><br>\`;
      }

      return () => {
        const ele = props.logEl.value as HTMLElement;
        if (ele) {
          ele.innerHTML += \`<span>🎒 Inventory system shutdown</span><br>\`;
        }
      };
    });

    return () => (
      <div>
        <InventoryCategory title="Weapons" items={weaponItems} logEl={props.logEl} />
        <InventoryCategory title="Armor" items={armorItems} logEl={props.logEl} />
        <InventoryCategory title="Potions" items={potionItems} logEl={props.logEl} />
      </div>
    );
  }
);`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Unmount order
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        When you click the &quot;Close Inventory&quot; button, the cleanup runs
        in the following order:
      </p>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong>🎒 Inventory system shutdown</strong> (Depth 1 – parent
            component)
          </li>
          <li>
            <strong>🗂️ Weapons category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Iron Sword unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Magic Staff unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Dragon Blade unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>🗂️ Armor category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Leather Armor unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Steel Helmet unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>🗂️ Potions category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Health Potion unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Mana Potion unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Elixir of Life unequipped</strong> (Depth 3)
          </li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 Key concepts
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>Parent-first cleanup:</strong> the parent component&apos;s
            cleanup runs first, followed by its children&apos;s cleanups.
          </li>
          <li>
            <strong>Depth-first traversal (DFS):</strong> after each child
            cleanup, all of that child&apos;s descendants clean up before moving
            to the next sibling. For example, when the Weapons category closes,
            all its items unmount before moving on to Armor.
          </li>
          <li>
            <strong>Resource cleanup:</strong> use this pattern to clean up
            event listeners, timers, subscriptions, and more.
          </li>
          <li>
            <strong>Preventing memory leaks:</strong> a consistent cleanup order
            helps avoid leaks and dangling references.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live demo
      </h2>

      <div class="my-8">
        <Example14 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Test scenarios
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ Basic unmount test
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Click the &quot;Open Inventory&quot; button to open it.</li>
          <li>
            Check the Lifecycle Log for initialization messages (Inventory
            system initialized → Categories opened → Items equipped).
          </li>
          <li>Click the &quot;Close Inventory&quot; button.</li>
          <li>
            Verify the cleanup order in the Lifecycle Log (Inventory shutdown →
            Categories closed → Items unequipped).
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ Repeated mount/unmount test
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Toggle Open/Close multiple times.</li>
          <li>
            Verify that mount/unmount always occurs in the same order in the
            log.
          </li>
          <li>Confirm there are no leaks and everything cleans up cleanly.</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ Visualizing the hierarchy
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Refer to the &quot;Component hierarchy&quot; section below.</li>
          <li>
            Understand the three-level nesting (Inventory → Category →
            ItemSlot).
          </li>
          <li>Confirm that a total of 12 cleanup functions run (1 + 3 + 8).</li>
        </ol>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Real-world use cases
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Cleaning event listeners:</strong> remove registered listeners
          when components unmount.
        </li>
        <li>
          <strong>Clearing timers:</strong> clean up <code>setInterval</code>{' '}
          and <code>setTimeout</code> timers.
        </li>
        <li>
          <strong>Closing WebSocket connections:</strong> safely terminate
          real-time connections.
        </li>
        <li>
          <strong>Cancelling animations:</strong> stop animations created with{' '}
          <code>requestAnimationFrame</code>.
        </li>
        <li>
          <strong>Unsubscribing from streams:</strong> cancel subscriptions in
          observer patterns to avoid memory leaks.
        </li>
      </ul>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Caveats
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            Cleanup functions run before the component is removed from the DOM.
          </li>
          <li>
            Avoid mutating state inside cleanup; it can lead to unexpected
            behavior.
          </li>
          <li>
            Keep cleanup logic pure—don&apos;t introduce new side effects inside
            cleanup.
          </li>
          <li>
            For async work, cancellation should happen in cleanup rather than
            waiting for completion.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related examples
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/examples/4"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/examples/4');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Example 4: Effect Lifecycle
          </a>{' '}
          - compare with effect cleanup behavior.
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
            Mount Hooks guide
          </a>{' '}
          - covers basic <code>mountCallback</code> usage.
        </li>
      </ul>
    </div>
  );
});
