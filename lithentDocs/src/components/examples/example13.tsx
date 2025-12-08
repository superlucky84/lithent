import { mount, mountCallback, Fragment, render, ref } from 'lithent';
import { state } from 'lithent/helper';

interface Guest {
  id: number;
  name: string;
  partySize: number;
  waitTime: number;
  vip: boolean;
  emoji: string;
}

const initialGuests: Guest[] = [
  {
    id: 1,
    name: 'Kim Family',
    partySize: 4,
    waitTime: 15,
    vip: false,
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    id: 2,
    name: 'Sarah & Alex',
    partySize: 2,
    waitTime: 10,
    vip: true,
    emoji: '💑',
  },
  {
    id: 3,
    name: 'Chen Party',
    partySize: 6,
    waitTime: 25,
    vip: false,
    emoji: '👥',
  },
  { id: 4, name: 'Jordan', partySize: 1, waitTime: 5, vip: false, emoji: '🧑' },
];

// Dynamic waitlist component (virtual DOM)
const WaitlistManager = mount(r => {
  const guests = state<Guest[]>([...initialGuests], r);
  const nextId = state(5, r);

  const sortByWaitTime = () => {
    guests.v = [...guests.v].sort((a, b) => a.waitTime - b.waitTime);
  };

  const sortByPartySize = () => {
    guests.v = [...guests.v].sort((a, b) => b.partySize - a.partySize);
  };

  const prioritizeVIP = () => {
    guests.v = [...guests.v].sort((a, b) => {
      if (a.vip && !b.vip) return -1;
      if (!a.vip && b.vip) return 1;
      return 0;
    });
  };

  const reverseOrder = () => {
    guests.v = [...guests.v].reverse();
  };

  const callGuest = (id: number) => {
    guests.v = guests.v.filter(g => g.id !== id);
  };

  const addRandomGuest = () => {
    const names = [
      'Park Family',
      'Taylor',
      'Martinez Party',
      'Lee & Kim',
      'Johnson',
    ];
    const emojis = ['👨‍👩‍👧', '🧑‍🦰', '👨‍👩‍👦‍👦', '👫', '🧑‍🦱'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    guests.v = [
      ...guests.v,
      {
        id: nextId.v,
        name: randomName,
        partySize: Math.floor(Math.random() * 6) + 1,
        waitTime: Math.floor(Math.random() * 30) + 5,
        vip: Math.random() > 0.7,
        emoji: randomEmoji,
      },
    ];
    nextId.v += 1;
  };

  const resetList = () => {
    guests.v = [...initialGuests];
    nextId.v = 5;
  };

  return () => (
    <Fragment>
      {/* Control panel */}
      <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 mb-3 rounded">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-semibold text-orange-800 dark:text-orange-200">
            🎛️ Waitlist Controls (virtual DOM)
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            onClick={sortByWaitTime}
            class="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            ⏱️ By Wait Time
          </button>
          <button
            onClick={sortByPartySize}
            class="px-2 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            👥 By Party Size
          </button>
          <button
            onClick={prioritizeVIP}
            class="px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700"
          >
            ⭐ VIP First
          </button>
          <button
            onClick={reverseOrder}
            class="px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            🔄 Reverse
          </button>
          <button
            onClick={addRandomGuest}
            class="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
          >
            ➕ Add Guest
          </button>
          <button
            onClick={resetList}
            class="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Waitlist */}
      {guests.v.map((guest, index) => (
        <div
          key={guest.id}
          class={`rounded-lg p-3 mb-2 border-l-4 shadow-sm transition-all duration-300 ${
            guest.vip
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500'
              : 'bg-white dark:bg-gray-800 border-blue-500'
          }`}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <div class="text-2xl">{guest.emoji}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-900 dark:text-white text-sm">
                    #{index + 1} {guest.name}
                  </span>
                  {guest.vip && (
                    <span class="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                      ⭐ VIP
                    </span>
                  )}
                  <span class="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    ID: {guest.id}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>👥 Party of {guest.partySize}</span>
                  <span>•</span>
                  <span>⏱️ ~{guest.waitTime} min</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => callGuest(guest.id)}
              class="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 ml-2"
            >
              📢 Call
            </button>
          </div>
        </div>
      ))}

      {guests.v.length === 0 && (
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-2">🎉</div>
          <p class="text-sm">No guests waiting! All tables are ready.</p>
        </div>
      )}
    </Fragment>
  );
});

export const Example13 = mount(() => {
  const containerRef = ref<null | HTMLElement>(null);
  const insertionPointRef = ref<null | HTMLElement>(null);

  mountCallback(() => {
    const container = containerRef.value as HTMLElement;
    const insertionPoint = insertionPointRef.value as HTMLElement;
    render(<WaitlistManager />, container, insertionPoint);
  });

  return () => (
    <div class="w-full max-w-2xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🍽️ Restaurant Waitlist Manager
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Test how list updates behave when real DOM and virtual DOM are mixed.
        </p>
      </div>

      <div
        ref={containerRef}
        class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[700px] overflow-y-auto"
      >
        {/* Top notice (real DOM) */}
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500">
          <div class="flex items-start gap-3">
            <div class="text-2xl">ℹ️</div>
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Welcome to Lithent Restaurant
              </h4>
              <p class="text-xs text-gray-700 dark:text-gray-300">
                Thank you for waiting! We'll call your name when your table is
                ready.
              </p>
              <span class="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                real DOM (fixed)
              </span>
            </div>
          </div>
        </div>

        {/* Middle: virtual DOM waitlist is inserted here */}

        {/* Bottom promo (real DOM - insertionPoint) */}
        <div
          ref={insertionPointRef}
          class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500"
        >
          <div class="flex items-start gap-3">
            <div class="text-2xl">🎁</div>
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Special Offer!
              </h4>
              <p class="text-xs text-gray-700 dark:text-gray-300">
                Get 10% off your meal if you join our rewards program today!
              </p>
              <span class="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                real DOM (fixed)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom footer (real DOM) */}
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-gray-400">
          <div class="flex items-center gap-2">
            <div class="text-xl">📞</div>
            <div class="text-xs text-gray-700 dark:text-gray-300">
              <p class="font-semibold">Contact: (555) 123-4567</p>
              <p class="text-gray-600 dark:text-gray-400">
                Hours: 11AM - 10PM Daily
              </p>
            </div>
            <span class="ml-auto px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              real DOM (fixed)
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>List + mixed DOM test:</strong> try sorting or reversing
          the waitlist. Verify that Lithent reorders DOM nodes correctly based
          on keys, while the real DOM (Welcome, Special Offer, Contact) stays
          untouched. When you click the Call button, the guest is removed from
          the list.
        </p>
      </div>
    </div>
  );
});
