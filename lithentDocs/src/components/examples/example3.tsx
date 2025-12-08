import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (pos: MousePosition) => any;
}

// Render prop pattern: track mouse position and pass it to the renderer
const MouseTracker = mount<MouseTrackerProps>(renew => {
  const position = state<MousePosition>({ x: 0, y: 0 }, renew);
  const containerRef = ref<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      position.v = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  return ({ render }) => (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      class="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-crosshair"
    >
      {render(position.v)}
    </div>
  );
});

// Emoji that follows the mouse cursor
const FollowerEmoji = ({
  emoji,
  pos,
}: {
  emoji: string;
  pos: MousePosition;
}) => (
  <div
    class="absolute text-4xl pointer-events-none transition-transform duration-100"
    style={{
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      transform: 'translate(-50%, -50%)',
    }}
  >
    {emoji}
  </div>
);

// Coordinate display
const CoordinateDisplay = mount(_r => {
  return ({ pos }: { pos: MousePosition }) => (
    <div class="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
      <div class="text-sm font-mono space-y-1">
        <div class="text-gray-600 dark:text-gray-400">
          X:{' '}
          <span class="font-bold text-blue-600 dark:text-blue-400">
            {Math.round(pos.x)}
          </span>
        </div>
        <div class="text-gray-600 dark:text-gray-400">
          Y:{' '}
          <span class="font-bold text-purple-600 dark:text-purple-400">
            {Math.round(pos.y)}
          </span>
        </div>
      </div>
    </div>
  );
});

// Background that changes color based on mouse position
const ColorfulBackground = mount(_r => {
  return ({ pos }: { pos: MousePosition }) => {
    const hue = (pos.x + pos.y) % 360;
    return (
      <div
        class="absolute inset-0 opacity-20 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, hsl(${hue}, 70%, 60%), transparent 50%)`,
        }}
      />
    );
  };
});

export const Example3 = mount((renew: any) => {
  const selectedDemo = state<'emoji' | 'coords' | 'colorful'>(
    'colorful',
    renew
  );

  const demos = [
    { id: 'emoji' as const, label: '🐱 Emoji follower', color: 'blue' },
    { id: 'coords' as const, label: '📍 Coordinate display', color: 'green' },
    {
      id: 'colorful' as const,
      label: '🎨 Colorful background',
      color: 'purple',
    },
  ];

  return () => (
    <div class="space-y-6">
      <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <p class="text-sm md:text-base text-orange-800 dark:text-orange-200">
          💡 <strong>Render prop pattern</strong>: a component receives the
          rendering logic as a function. In this example,{' '}
          <code>MouseTracker</code> tracks the mouse position and passes it into
          the render prop.
        </p>
      </div>

      <div class="flex gap-2 flex-wrap">
        {demos.map(demo => (
          <button
            onClick={() => (selectedDemo.v = demo.id)}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDemo.v === demo.id
                ? `bg-${demo.color}-600 text-white shadow-lg scale-105`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      {selectedDemo.v === 'emoji' && (
        <MouseTracker
          render={pos => (
            <>
              <div class="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none">
                Move your mouse inside the area
              </div>
              <FollowerEmoji emoji="🐱" pos={pos} />
            </>
          )}
        />
      )}

      {selectedDemo.v === 'coords' && (
        <MouseTracker
          render={pos => (
            <>
              <div class="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none">
                Move your mouse to see the coordinates
              </div>
              <CoordinateDisplay pos={pos} />
              <div
                class="absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </>
          )}
        />
      )}

      {selectedDemo.v === 'colorful' && (
        <MouseTracker
          render={pos => (
            <>
              <ColorfulBackground pos={pos} />
              <div class="absolute inset-0 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm pointer-events-none z-10">
                Move your mouse to change the colors
              </div>
            </>
          )}
        />
      )}

      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📌 Key ideas
        </h4>
        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            •{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              render
            </code>{' '}
            prop as a function that receives data
          </li>
          <li>
            • <code>MouseTracker</code> encapsulates the mouse tracking logic
          </li>
          <li>• Rendering logic can be implemented freely from the outside</li>
          <li>• Great for building reusable and flexible components</li>
        </ul>
      </div>
    </div>
  );
});
