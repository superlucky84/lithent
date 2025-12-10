import { mount, mountCallback, ref } from 'lithent';
import { state } from 'lithent/helper';

interface Item {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const weaponItems: Item[] = [
  { id: 'w1', name: 'Iron Sword', icon: '⚔️', rarity: 'common' },
  { id: 'w2', name: 'Magic Staff', icon: '🪄', rarity: 'rare' },
  { id: 'w3', name: 'Dragon Blade', icon: '🗡️', rarity: 'legendary' },
];

const armorItems: Item[] = [
  { id: 'a1', name: 'Leather Armor', icon: '🛡️', rarity: 'common' },
  { id: 'a2', name: 'Steel Helmet', icon: '⛑️', rarity: 'rare' },
];

const potionItems: Item[] = [
  { id: 'p1', name: 'Health Potion', icon: '🧪', rarity: 'common' },
  { id: 'p2', name: 'Mana Potion', icon: '💙', rarity: 'rare' },
  { id: 'p3', name: 'Elixir of Life', icon: '✨', rarity: 'epic' },
];

// Item component (Depth 3)
const ItemSlot = mount<{
  item: Item;
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      const parent = ele.parentElement;
      if (parent) {
        ele.innerHTML += `<span class="text-blue-400">📦 ${props.item.name} equipped</span><br>`;
        parent.scrollTop = parent.scrollHeight;
      }
    }

    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        const parent = ele.parentElement;
        if (parent) {
          ele.innerHTML += `<span class="text-orange-400">❌ ${props.item.name} unequipped</span><br>`;
          parent.scrollTop = parent.scrollHeight;
        }
      }
    };
  });

  const rarityColors = {
    common: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
    rare: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    epic: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    legendary:
      'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500',
  };

  return () => (
    <div
      class={`flex items-center gap-2 p-2 rounded border ${rarityColors[props.item.rarity]}`}
    >
      <span class="text-2xl">{props.item.icon}</span>
      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
        {props.item.name}
      </span>
    </div>
  );
});

// Category component (Depth 2)
const InventoryCategory = mount<{
  title: string;
  icon: string;
  items: Item[];
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      const parent = ele.parentElement;
      if (parent) {
        ele.innerHTML += `<span class="text-green-400">📂 ${props.title} category opened</span><br>`;
        parent.scrollTop = parent.scrollHeight;
      }
    }

    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        const parent = ele.parentElement;
        if (parent) {
          ele.innerHTML += `<span class="text-red-400">🗂️ ${props.title} category closed</span><br>`;
          parent.scrollTop = parent.scrollHeight;
        }
      }
    };
  });

  return () => (
    <div class="mb-3">
      <div class="flex items-center gap-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
        <span class="text-xl">{props.icon}</span>
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
          {props.title}
        </h4>
        <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {props.items.length} items
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2 pl-4">
        {props.items.map(item => (
          <div key={item.id}>
            <ItemSlot item={item} logEl={props.logEl} />
          </div>
        ))}
      </div>
    </div>
  );
});

// Inventory component (Depth 1)
const Inventory = mount<{ logEl: { value: HTMLElement | null } }>(
  (_r, props) => {
    mountCallback(() => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        const parent = ele.parentElement;
        if (parent) {
          ele.innerHTML += `<span class="text-purple-400 font-bold">🎒 Inventory system initialized</span><br>`;
          parent.scrollTop = parent.scrollHeight;
        }
      }

      return () => {
        const ele = props.logEl.value as HTMLElement;
        if (ele) {
          const parent = ele.parentElement;
          if (parent) {
            ele.innerHTML += `<span class="text-pink-400 font-bold">🎒 Inventory system shutdown</span><br>`;
            parent.scrollTop = parent.scrollHeight;
          }
        }
      };
    });

    return () => (
      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <span class="text-2xl">🎒</span>
          <h3 class="text-base font-bold text-gray-900 dark:text-white">
            Game Inventory
          </h3>
        </div>

        <InventoryCategory
          title="Weapons"
          icon="⚔️"
          items={weaponItems}
          logEl={props.logEl}
        />
        <InventoryCategory
          title="Armor"
          icon="🛡️"
          items={armorItems}
          logEl={props.logEl}
        />
        <InventoryCategory
          title="Potions"
          icon="🧪"
          items={potionItems}
          logEl={props.logEl}
        />
      </div>
    );
  }
);

export const Example14 = mount(r => {
  const isOpen = state(true, r);
  const logEl = ref<HTMLElement | null>(null);

  const toggle = () => {
    isOpen.v = !isOpen.v;
  };

  const clearLog = () => {
    if (logEl.value) {
      logEl.value.innerHTML = '';
    }
  };

  return () => (
    <div class="w-full max-w-3xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🎮 Game Inventory System
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Test nested components&apos; mount/unmount callbacks.
        </p>
      </div>

      {/* Control panel */}
      <div class="flex gap-2 mb-4">
        <button
          onClick={toggle}
          class={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            isOpen.v
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isOpen.v ? '🎒 Close Inventory' : '🎒 Open Inventory'}
        </button>
        <button
          onClick={clearLog}
          class="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-medium"
        >
          🗑️ Clear Log
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory area */}
        <div class="order-2 md:order-1">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Inventory View
          </h4>
          {isOpen.v ? (
            <Inventory logEl={logEl} />
          ) : (
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <div class="text-4xl mb-2">🔒</div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Inventory is closed
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Click "Open Inventory" to view items
              </p>
            </div>
          )}
        </div>

        {/* Log area */}
        <div class="order-1 md:order-2">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Lifecycle Log
          </h4>
          <div class="bg-gray-900 rounded-lg p-4 h-[400px] overflow-y-auto border border-gray-700">
            <div ref={logEl} class="text-xs font-mono leading-relaxed"></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 Watch how nested components mount and unmount in order
          </p>
        </div>
      </div>

      <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
          💡 <strong>Nested unmount test:</strong> when you click &quot;Close
          Inventory&quot;, cleanup runs in this order:
        </p>
        <ol class="text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1">
          <li>
            1. <strong>Inventory system shutdown</strong> (Depth 1 - parent)
          </li>
          <li>
            2. <strong>Weapons category closed</strong> → all items in that
            category unequipped
          </li>
          <li>
            3. <strong>Armor category closed</strong> → all items in that
            category unequipped
          </li>
          <li>
            4. <strong>Potions category closed</strong> → all items in that
            category unequipped
          </li>
        </ol>
      </div>

      <div class="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <h4 class="text-xs font-semibold text-purple-800 dark:text-purple-200 mb-2">
          🎯 Component hierarchy
        </h4>
        <div class="text-xs font-mono text-purple-700 dark:text-purple-300 leading-relaxed">
          <div>Inventory (Depth 1)</div>
          <div class="ml-4">├─ Weapons Category (Depth 2)</div>
          <div class="ml-8">│ ├─ Iron Sword (Depth 3)</div>
          <div class="ml-8">│ ├─ Magic Staff (Depth 3)</div>
          <div class="ml-8">│ └─ Dragon Blade (Depth 3)</div>
          <div class="ml-4">├─ Armor Category (Depth 2)</div>
          <div class="ml-8">│ ├─ Leather Armor (Depth 3)</div>
          <div class="ml-8">│ └─ Steel Helmet (Depth 3)</div>
          <div class="ml-4">└─ Potions Category (Depth 2)</div>
          <div class="ml-8">├─ Health Potion (Depth 3)</div>
          <div class="ml-8">├─ Mana Potion (Depth 3)</div>
          <div class="ml-8">└─ Elixir of Life (Depth 3)</div>
        </div>
      </div>
    </div>
  );
});
