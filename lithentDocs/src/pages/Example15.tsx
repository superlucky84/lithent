import { mount } from 'lithent';
import { Example15 } from '@/components/examples/example15';
import { CodeBlock } from '@/components/CodeBlock';

export const Example15Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Nested Props Update (Volume Controller)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example tests how state managed in a parent component is passed and
        updated through props to multiple levels of nested components. A single
        volume value is expressed in different ways across 3 components.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key Test Points
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nested Props Update</strong>: Verify that when the parent
          component's state changes, the values passed through props are
          accurately propagated to all nested child components. This is a core
          test to validate that Lithent's reactive system works correctly.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Component Structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        This example is a volume control system with a 3-level nested structure:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Root</strong>: Manage volume state (0-100)
        </li>
        <li>
          <strong>Depth 1 (VolumeDisplay)</strong>: Display volume as a number
        </li>
        <li>
          <strong>Depth 2 (VolumeBar)</strong>: Display volume as a progress bar
        </li>
        <li>
          <strong>Depth 3 (VolumeEmoji)</strong>: Display volume with emoji (🔇
          🔈 🔉 🔊)
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code Example
      </h2>

      <CodeBlock
        code={`import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

// Depth 3: Display volume with emoji
const VolumeEmoji = mount<{ volume: number }>(() => ({ volume }) => {
  const getEmoji = (vol: number) => {
    if (vol === 0) return '🔇';
    if (vol < 30) return '🔈';
    if (vol < 70) return '🔉';
    return '🔊';
  };

  return <div>{getEmoji(volume)}</div>;
});

// Depth 2: Display volume with progress bar
const VolumeBar = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <div>
      <div class="progress-bar" style={{ width: \`\${volume}%\` }} />
      <VolumeEmoji volume={volume} />
    </div>
  );
});

// Depth 1: Display volume as a number
const VolumeDisplay = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <Fragment>
      <div class="volume-number">{volume}</div>
      <VolumeBar volume={volume} />
    </Fragment>
  );
});

// Root: Volume state management
const VolumeController = mount(renew => {
  const volume = state(50, renew);

  const increase = () => {
    if (volume.v < 100) volume.v += 10;
  };

  return () => (
    <div>
      <button onClick={increase}>+10</button>
      <VolumeDisplay volume={volume.v} />
    </div>
  );
});`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Props Flow
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <pre class="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre">
          {`Root Component
  ├─ volume: state<number>
  │
  └─> VolumeDisplay (Depth 1)
       ├─ props: { volume: number }
       │
       └─> VolumeBar (Depth 2)
            ├─ props: { volume: number }
            │
            └─> VolumeEmoji (Depth 3)
                 └─ props: { volume: number }`}
        </pre>
      </div>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        When{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          volume.v
        </code>{' '}
        changes in the Root component:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>Root's updater function executes to generate a new virtual DOM</li>
        <li>VolumeDisplay receives the new volume prop and updates</li>
        <li>VolumeBar receives the new volume prop and updates</li>
        <li>
          VolumeEmoji receives the new volume prop and updates simultaneously
        </li>
      </ol>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 Key Concepts
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>Unidirectional Data Flow:</strong> Props always flow from
            parent to child only.
          </li>
          <li>
            <strong>Immutability:</strong> Props cannot be directly modified in
            child components.
          </li>
          <li>
            <strong>Automatic Updates:</strong> When a parent's state changes,
            all children receiving props automatically update.
          </li>
          <li>
            <strong>Efficient Rendering:</strong> Lithent efficiently updates
            only the parts that have changed.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example15 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Test Scenarios
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ Test with Slider
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Move the slider to change the volume value</li>
          <li>
            Verify that VolumeDisplay(number), VolumeBar(bar), and
            VolumeEmoji(emoji) all update simultaneously
          </li>
          <li>Confirm that values propagate in real-time</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ Test with Buttons
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Click +/- buttons to increase/decrease by 10</li>
          <li>Verify that all components update with each button click</li>
          <li>Verify that buttons are disabled at 0 and 100</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ Verify Emoji Changes
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>0: 🔇 (muted)</li>
          <li>1-29: 🔈 (low volume)</li>
          <li>30-69: 🔉 (medium volume)</li>
          <li>70-100: 🔊 (high volume)</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Cautions
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            Props are read-only. Do not directly modify props in child
            components.
          </li>
          <li>
            Props changes should only be made through the parent component's
            state or variables.
          </li>
          <li>
            Deeper nesting can affect performance, so avoid unnecessary nesting.
          </li>
          <li>
            If props drilling becomes too deep, consider using Context API.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Practical Use Cases
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Multi-step Forms:</strong> Passing data step-by-step in
          registration or payment processes
        </li>
        <li>
          <strong>Dashboards:</strong> Passing user information to multiple
          widget components
        </li>
        <li>
          <strong>Theme Systems:</strong> Propagating theme settings to all UI
          components
        </li>
        <li>
          <strong>Permission Management:</strong> Conditionally rendering UI
          based on user permissions
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Examples
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
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
            Props Guide
          </a>{' '}
          - Basic usage of Props
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
