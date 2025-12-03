import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (pos: MousePosition) => any;
}

// Render Prop 패턴: 마우스 위치를 추적하고 render prop에 전달
const MouseTracker = mount<MouseTrackerProps>((renew, props) => {
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

  return () => (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      class="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-crosshair"
    >
      {props.render(position.v)}
    </div>
  );
});

// 마우스를 따라다니는 이모지
const FollowerEmoji = mount(_r => {
  return ({ emoji, pos }: { emoji: string; pos: MousePosition }) => (
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
});

// 좌표 정보 표시
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

// 마우스 위치에 따라 색상이 변하는 배경
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
    { id: 'emoji' as const, label: '🐱 이모지 팔로워', color: 'blue' },
    { id: 'coords' as const, label: '📍 좌표 표시', color: 'green' },
    { id: 'colorful' as const, label: '🎨 컬러풀 배경', color: 'purple' },
  ];

  return () => (
    <div class="space-y-6">
      <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <p class="text-sm md:text-base text-orange-800 dark:text-orange-200">
          💡 <strong>Render Prop 패턴</strong>: 컴포넌트가 렌더링 로직을 함수로
          받아서 실행합니다. 이 예제에서 MouseTracker는 마우스 위치를 추적하고,
          render prop으로 받은 함수에 데이터를 전달합니다.
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
                마우스를 움직여보세요!
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
                마우스를 움직여 좌표를 확인하세요
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
                마우스를 움직여 색상을 변경하세요
              </div>
            </>
          )}
        />
      )}

      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📌 핵심 개념
        </h4>
        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            •{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              render
            </code>{' '}
            prop을 함수로 받아서 데이터 전달
          </li>
          <li>• MouseTracker가 마우스 위치 추적 로직을 캡슐화</li>
          <li>• 렌더링 로직은 외부에서 자유롭게 구현 가능</li>
          <li>• 재사용성과 유연성이 뛰어난 컴포넌트 디자인 패턴</li>
        </ul>
      </div>
    </div>
  );
});
