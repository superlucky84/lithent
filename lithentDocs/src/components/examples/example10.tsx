import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Topping {
  id: string;
  name: string;
  emoji: string;
  price: number;
  calories: number;
  category: 'meat' | 'veggie' | 'cheese' | 'sauce';
}

const toppings: Topping[] = [
  // Meat
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    emoji: '🍕',
    price: 2.5,
    calories: 140,
    category: 'meat',
  },
  {
    id: 'sausage',
    name: 'Sausage',
    emoji: '🌭',
    price: 2.5,
    calories: 130,
    category: 'meat',
  },
  {
    id: 'bacon',
    name: 'Bacon',
    emoji: '🥓',
    price: 3.0,
    calories: 150,
    category: 'meat',
  },
  {
    id: 'ham',
    name: 'Ham',
    emoji: '🍖',
    price: 2.5,
    calories: 110,
    category: 'meat',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🍗',
    price: 3.0,
    calories: 120,
    category: 'meat',
  },

  // Veggie
  {
    id: 'mushroom',
    name: 'Mushroom',
    emoji: '🍄',
    price: 1.5,
    calories: 20,
    category: 'veggie',
  },
  {
    id: 'olive',
    name: 'Olive',
    emoji: '🫒',
    price: 1.5,
    calories: 30,
    category: 'veggie',
  },
  {
    id: 'pepper',
    name: 'Bell Pepper',
    emoji: '🫑',
    price: 1.5,
    calories: 25,
    category: 'veggie',
  },
  {
    id: 'onion',
    name: 'Onion',
    emoji: '🧅',
    price: 1.0,
    calories: 15,
    category: 'veggie',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    price: 1.5,
    calories: 20,
    category: 'veggie',
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    emoji: '🍍',
    price: 2.0,
    calories: 40,
    category: 'veggie',
  },

  // Cheese
  {
    id: 'mozzarella',
    name: 'Extra Mozzarella',
    emoji: '🧀',
    price: 2.0,
    calories: 80,
    category: 'cheese',
  },
  {
    id: 'cheddar',
    name: 'Cheddar',
    emoji: '🧀',
    price: 2.0,
    calories: 90,
    category: 'cheese',
  },
  {
    id: 'parmesan',
    name: 'Parmesan',
    emoji: '🧀',
    price: 2.5,
    calories: 85,
    category: 'cheese',
  },

  // Sauce
  {
    id: 'basil',
    name: 'Fresh Basil',
    emoji: '🌿',
    price: 1.0,
    calories: 5,
    category: 'sauce',
  },
  {
    id: 'garlic',
    name: 'Garlic',
    emoji: '🧄',
    price: 1.0,
    calories: 10,
    category: 'sauce',
  },
  {
    id: 'hotpepper',
    name: 'Hot Pepper',
    emoji: '🌶️',
    price: 1.5,
    calories: 15,
    category: 'sauce',
  },
];

const presets = {
  pepperoni: ['pepperoni', 'mozzarella'],
  veggie: ['mushroom', 'olive', 'pepper', 'onion', 'tomato', 'mozzarella'],
  meatLovers: ['pepperoni', 'sausage', 'bacon', 'ham', 'mozzarella'],
  hawaiian: ['ham', 'pineapple', 'mozzarella'],
  supreme: [
    'pepperoni',
    'sausage',
    'mushroom',
    'olive',
    'pepper',
    'onion',
    'mozzarella',
  ],
};

export const Example10 = mount(r => {
  const selectedToppings = state<string[]>(['pepperoni', 'mozzarella'], r);
  const size = state<'small' | 'medium' | 'large'>('medium', r);
  const crust = state<'thin' | 'regular' | 'thick'>('regular', r);

  const basePrice = {
    small: 8.99,
    medium: 12.99,
    large: 16.99,
  };

  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.v.includes(toppingId)) {
      selectedToppings.v = selectedToppings.v.filter(id => id !== toppingId);
    } else {
      selectedToppings.v = [...selectedToppings.v, toppingId];
    }
  };

  const loadPreset = (preset: keyof typeof presets) => {
    selectedToppings.v = [...presets[preset]];
  };

  const clearAll = () => {
    selectedToppings.v = [];
  };

  return () => {
    const selectedToppingObjects = toppings.filter(t =>
      selectedToppings.v.includes(t.id)
    );
    const toppingsCost = selectedToppingObjects.reduce(
      (sum, t) => sum + t.price,
      0
    );
    const totalPrice = basePrice[size.v] + toppingsCost;
    const totalCalories =
      selectedToppingObjects.reduce((sum, t) => sum + t.calories, 0) + 200; // 200 base calories

    const categoryGroups = {
      meat: toppings.filter(t => t.category === 'meat'),
      veggie: toppings.filter(t => t.category === 'veggie'),
      cheese: toppings.filter(t => t.category === 'cheese'),
      sauce: toppings.filter(t => t.category === 'sauce'),
    };

    return (
      <div class="w-full max-w-6xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🍕 Pizza Builder
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Build your perfect pizza with checkboxes and radio buttons
          </p>
        </div>

        {/* Preset Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => loadPreset('pepperoni')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            🍕 Pepperoni
          </button>
          <button
            onClick={() => loadPreset('veggie')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            🥗 Veggie
          </button>
          <button
            onClick={() => loadPreset('meatLovers')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-700 hover:bg-orange-800 transition-colors"
          >
            🥩 Meat Lovers
          </button>
          <button
            onClick={() => loadPreset('hawaiian')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            🏝️ Hawaiian
          </button>
          <button
            onClick={() => loadPreset('supreme')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            👑 Supreme
          </button>
          <button
            onClick={clearAll}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear All
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pizza Preview & Summary */}
          <div class="order-2 lg:order-1 space-y-4">
            {/* Visual Pizza Preview */}
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Your Pizza
              </h4>
              <div class="bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full aspect-square p-8 flex items-center justify-center shadow-2xl">
                <div class="text-center">
                  <div class="text-6xl mb-2">🍕</div>
                  <div class="flex flex-wrap justify-center gap-1 max-w-xs">
                    {selectedToppingObjects.map(topping => (
                      <span class="text-2xl" title={topping.name}>
                        {topping.emoji}
                      </span>
                    ))}
                  </div>
                  <div class="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {size.v.charAt(0).toUpperCase() + size.v.slice(1)} ·{' '}
                    {crust.v.charAt(0).toUpperCase() + crust.v.slice(1)} Crust
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Nutrition Summary */}
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Order Summary
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>
                    {size.v.charAt(0).toUpperCase() + size.v.slice(1)} Pizza (
                    {crust.v} crust)
                  </span>
                  <span>${basePrice[size.v].toFixed(2)}</span>
                </div>
                {selectedToppingObjects.length > 0 && (
                  <div class="text-gray-600 dark:text-gray-400">
                    <div class="font-medium mb-1">Toppings:</div>
                    {selectedToppingObjects.map(topping => (
                      <div class="flex justify-between pl-3">
                        <span>
                          {topping.emoji} {topping.name}
                        </span>
                        <span>${topping.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div class="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div class="font-semibold mb-1">Nutrition Info (approx.)</div>
                  <div>🔥 Calories: ~{totalCalories}</div>
                  <div>🧈 Toppings: {selectedToppingObjects.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div class="order-1 lg:order-2 space-y-4">
            {/* Size Selection - Radio Buttons */}
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Size
              </h4>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value="small"
                    checked={size.v === 'small'}
                    onChange={(e: Event) => {
                      size.v = (e.target as HTMLInputElement).value as
                        | 'small'
                        | 'medium'
                        | 'large';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Small ($8.99)
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value="medium"
                    checked={size.v === 'medium'}
                    onChange={(e: Event) => {
                      size.v = (e.target as HTMLInputElement).value as
                        | 'small'
                        | 'medium'
                        | 'large';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Medium ($12.99)
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value="large"
                    checked={size.v === 'large'}
                    onChange={(e: Event) => {
                      size.v = (e.target as HTMLInputElement).value as
                        | 'small'
                        | 'medium'
                        | 'large';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Large ($16.99)
                  </span>
                </label>
              </div>
            </div>

            {/* Crust Selection - Radio Buttons */}
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Crust
              </h4>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="crust"
                    value="thin"
                    checked={crust.v === 'thin'}
                    onChange={(e: Event) => {
                      crust.v = (e.target as HTMLInputElement).value as
                        | 'thin'
                        | 'regular'
                        | 'thick';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Thin
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="crust"
                    value="regular"
                    checked={crust.v === 'regular'}
                    onChange={(e: Event) => {
                      crust.v = (e.target as HTMLInputElement).value as
                        | 'thin'
                        | 'regular'
                        | 'thick';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Regular
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="crust"
                    value="thick"
                    checked={crust.v === 'thick'}
                    onChange={(e: Event) => {
                      crust.v = (e.target as HTMLInputElement).value as
                        | 'thin'
                        | 'regular'
                        | 'thick';
                    }}
                    class="w-4 h-4 text-[#42b883] focus:ring-[#42b883]"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    Thick
                  </span>
                </label>
              </div>
            </div>

            {/* Toppings - Checkboxes */}
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Toppings
              </h4>

              {/* Meat */}
              <div class="mb-3">
                <div class="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  🥩 Meat
                </div>
                <div class="grid grid-cols-2 gap-2">
                  {categoryGroups.meat.map(topping => (
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={topping.id}
                        checked={selectedToppings.v.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        class="w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {topping.emoji} {topping.name}{' '}
                        <span class="text-xs text-gray-500">
                          (+${topping.price})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Veggie */}
              <div class="mb-3">
                <div class="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                  🥗 Vegetables
                </div>
                <div class="grid grid-cols-2 gap-2">
                  {categoryGroups.veggie.map(topping => (
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={topping.id}
                        checked={selectedToppings.v.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        class="w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {topping.emoji} {topping.name}{' '}
                        <span class="text-xs text-gray-500">
                          (+${topping.price})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cheese */}
              <div class="mb-3">
                <div class="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                  🧀 Cheese
                </div>
                <div class="grid grid-cols-2 gap-2">
                  {categoryGroups.cheese.map(topping => (
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={topping.id}
                        checked={selectedToppings.v.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        class="w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {topping.emoji} {topping.name}{' '}
                        <span class="text-xs text-gray-500">
                          (+${topping.price})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sauce & Extras */}
              <div>
                <div class="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                  🌶️ Extras
                </div>
                <div class="grid grid-cols-2 gap-2">
                  {categoryGroups.sauce.map(topping => (
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={topping.id}
                        checked={selectedToppings.v.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        class="w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {topping.emoji} {topping.name}{' '}
                        <span class="text-xs text-gray-500">
                          (+${topping.price})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Checking checkbox & radio behavior:</strong> checkboxes
            allow multiple toppings to be selected at once, while radios for
            size and crust allow only a single choice. Verify that Lithent keeps
            the <code>checked</code> attribute in sync and handles{' '}
            <code>onChange</code> events correctly.
          </p>
        </div>
      </div>
    );
  };
});
