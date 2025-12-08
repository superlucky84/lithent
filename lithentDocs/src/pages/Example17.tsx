import { mount } from 'lithent';
import { Example17 } from '@/components/examples/example17';
import { CodeBlock } from '@/components/CodeBlock';

export const Example17Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        SVG Rendering (Traffic Light)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example tests whether Lithent can accurately render SVG elements
        and reactively update SVG attributes (fill, opacity, stroke, etc.). You
        can verify various SVG features through the traffic light.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key Test Points
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>SVG Rendering</strong>: Verify that Lithent accurately renders
          SVG elements (rect, circle) and that dynamic attribute changes
          (opacity, fill, stroke) update reactively. Also test whether
          conditional rendering and CSS classes can be applied to SVG elements.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Component Structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        This example consists of the following elements:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Control Panel</strong>: Next Light button and Auto Mode toggle
        </li>
        <li>
          <strong>Traffic Light SVG</strong>:
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>Frame box (rect element)</li>
            <li>Red light (circle, cy=85)</li>
            <li>Yellow light (circle, cy=200)</li>
            <li>Green light (circle, cy=315)</li>
            <li>
              Glow effect on active light (conditionally rendered circle with
              stroke)
            </li>
          </ul>
        </li>
        <li>
          <strong>Current Status Display</strong>: Real-time display of active
          light information
        </li>
        <li>
          <strong>SVG Elements Description</strong>: Explanation of each SVG
          element and attribute
        </li>
      </ol>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code Example
      </h2>

      <CodeBlock
        code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

type LightState = 'red' | 'yellow' | 'green';

const TrafficLight = mount(renew => {
  const currentLight = state<LightState>('red', renew);
  const autoMode = state(false, renew);
  let autoInterval: number | null = null;

  const lightSequence: LightState[] = ['red', 'yellow', 'green'];

  const nextLight = () => {
    const currentIndex = lightSequence.indexOf(currentLight.v);
    const nextIndex = (currentIndex + 1) % lightSequence.length;
    currentLight.v = lightSequence[nextIndex];
  };

  const toggleAutoMode = () => {
    autoMode.v = !autoMode.v;

    if (autoMode.v) {
      autoInterval = window.setInterval(() => {
        nextLight();
      }, 2000);
    } else if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  };

  const getLightOpacity = (light: LightState) => {
    return currentLight.v === light ? 1 : 0.2;
  };

  return () => (
    <div>
      {/* Control Panel */}
      <button onClick={nextLight} disabled={autoMode.v}>
        Next Light
      </button>
      <button onClick={toggleAutoMode}>
        {autoMode.v ? 'Stop Auto' : 'Auto Mode'}
      </button>

      {/* Traffic Light SVG */}
      <svg
        width="200"
        height="400"
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Frame box */}
        <rect
          x="25"
          y="25"
          width="150"
          height="350"
          rx="20"
          fill="#1F2937"
        />

        {/* Red light */}
        <circle
          cx="100"
          cy="85"
          r="40"
          fill="#EF4444"
          opacity={getLightOpacity('red')}
        />
        {currentLight.v === 'red' && (
          <circle
            cx="100"
            cy="85"
            r="45"
            fill="none"
            stroke="#EF4444"
            stroke-width="3"
            opacity="0.5"
            class="animate-pulse"
          />
        )}

        {/* Yellow light */}
        <circle
          cx="100"
          cy="200"
          r="40"
          fill="#FBBF24"
          opacity={getLightOpacity('yellow')}
        />

        {/* Green light */}
        <circle
          cx="100"
          cy="315"
          r="40"
          fill="#10B981"
          opacity={getLightOpacity('green')}
        />
      </svg>
    </div>
  );
});`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        SVG Elements and Attributes
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          SVG Elements Used
        </h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;svg&gt;
            </code>
            : SVG container (width, height, viewBox, <strong>xmlns</strong>{' '}
            attribute)
            <div class="ml-6 mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <strong class="text-red-700 dark:text-red-300">
                ⚠️ Important:
              </strong>{' '}
              <code class="px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded text-xs">
                xmlns="http://www.w3.org/2000/svg"
              </code>{' '}
              attribute is <strong>required</strong>. Without this attribute,
              the browser cannot render SVG correctly.
            </div>
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;rect&gt;
            </code>
            : Rectangle element (x, y, width, height, rx for rounded corners)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;circle&gt;
            </code>
            : Circle element (cx, cy for center position, r for radius)
          </li>
        </ul>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3 mt-4">
          Dynamically Updated Attributes
        </h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              opacity
            </code>
            : Current active light is 1.0, others are 0.2
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              fill
            </code>
            : Fill color of element (Red: #EF4444, Yellow: #FBBF24, Green:
            #10B981)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              stroke
            </code>
            : Outline color (for glow effect)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              stroke-width
            </code>
            : Outline thickness
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 Key Concepts
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>SVG in JSX:</strong> Lithent allows writing SVG elements
            naturally in JSX syntax.
          </li>
          <li>
            <strong>Reactive SVG Attributes:</strong> Attributes like opacity,
            fill, stroke automatically update when state changes.
          </li>
          <li>
            <strong>Conditional SVG Rendering:</strong> Glow effect (outer
            circle) is conditionally rendered only on the active light.
          </li>
          <li>
            <strong>CSS Class Application:</strong> Tailwind CSS classes
            (animate-pulse, transition-opacity) can be applied to SVG elements.
          </li>
          <li>
            <strong>Timer Management:</strong> Auto mode is implemented with
            setInterval and cleaned up with clearInterval based on component
            state.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example17 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Test Scenarios
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ Manual Light Switching
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Click "Next Light" button to switch lights</li>
          <li>Verify that lights cycle through Red → Yellow → Green → Red</li>
          <li>
            Verify that only the current active light is bright and others are
            dim
          </li>
          <li>
            Verify that outline glow effect (animate-pulse) appears on active
            light
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ Auto Mode Test
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Click "Auto Mode" button</li>
          <li>Verify that lights automatically switch every 2 seconds</li>
          <li>Verify that "Next Light" button is disabled</li>
          <li>Verify that "Stop Auto" button stops auto mode</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ SVG Rendering Verification
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Verify that traffic light frame (rect) has rounded corners</li>
          <li>Verify that 3 circles are rendered at correct positions</li>
          <li>
            Verify that smooth transition effect is applied during opacity
            changes
          </li>
          <li>
            Use browser dev tools to verify SVG elements have correct attribute
            values
          </li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          🌟 Practical Use Cases
        </h3>
        <p class="text-sm text-green-700 dark:text-green-300 mb-2">
          Dynamic UI elements using SVG are useful in the following cases:
        </p>
        <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
          <li>
            • <strong>Icon Systems</strong>: Dynamic icons that change color and
            style based on state
          </li>
          <li>
            • <strong>Data Visualization</strong>: Charts and graphs that update
            in real-time
          </li>
          <li>
            • <strong>Animations</strong>: Smooth SVG animations combined with
            CSS transitions
          </li>
          <li>
            • <strong>UI Components</strong>: Progress bars, loading spinners,
            status indicators, etc.
          </li>
          <li>
            • <strong>Interactive Diagrams</strong>: Diagrams or flowcharts that
            change on click/hover
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Cautions
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong class="text-red-700 dark:text-red-300">
              xmlns attribute required:
            </strong>{' '}
            <code class="px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-900 rounded text-xs font-mono">
              xmlns="http://www.w3.org/2000/svg"
            </code>{' '}
            attribute is required for SVG to render correctly. Without this
            attribute, browsers treat SVG elements as regular HTML elements and
            they won't display properly.
          </li>
          <li>
            <strong>Attribute Names:</strong> SVG attributes use kebab-case
            (stroke-width, fill-rule, etc.)
          </li>
          <li>
            <strong>Timer Cleanup:</strong> When using setInterval, clean it up
            with clearInterval on component unmount to prevent memory leaks
          </li>
          <li>
            <strong>viewBox:</strong> Using viewBox makes SVG scale responsively
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Guides
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
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
            State Guide
          </a>{' '}
          - Reactive state management
        </li>
        <li>
          <a
            href="/guide/updater"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/updater');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Updater Guide
          </a>{' '}
          - Component update mechanism
        </li>
      </ul>
    </div>
  );
});
