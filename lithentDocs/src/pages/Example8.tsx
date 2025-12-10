import { CodeBlock } from '@/components/CodeBlock';
import { Example8 } from '@/components/examples/example8';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

const example8Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Character {
  face: string;
  hair: string;
  eyes: string;
  outfit: string;
}

const CharacterCreator = mount(r => {
  const character = state<Character>({
    face: '😊',
    hair: '🦰',
    eyes: '👀',
    outfit: '👔',
  }, r);

  const updateCharacter = (key: keyof Character, value: string) => {
    character.v = { ...character.v, [key]: value };
  };

  return () => (
    <>
      {/* Character Preview */}
      <div class="preview">
        <div>{character.v.face}</div>
        <div>{character.v.hair} {character.v.eyes}</div>
        <div>{character.v.outfit}</div>
      </div>

      {/* Select Controls */}
      <select
        value={character.v.face}
        onChange={(e) => updateCharacter('face', e.target.value)}
      >
        <option value="😊" selected={character.v.face === '😊'}>Happy</option>
        <option value="😎" selected={character.v.face === '😎'}>Cool</option>
        <option value="🤓" selected={character.v.face === '🤓'}>Nerdy</option>
      </select>

      <select
        value={character.v.hair}
        onChange={(e) => updateCharacter('hair', e.target.value)}
      >
        <option value="🦰" selected={character.v.hair === '🦰'}>Red Hair</option>
        <option value="🦱" selected={character.v.hair === '🦱'}>Curly</option>
        <option value="🦲" selected={character.v.hair === '🦲'}>Bald</option>
      </select>
    </>
  );
});
`;

export const Example8Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Select Controls (Character Creator)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This emoji-based character creator shows how the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;select&gt;
      </code>{' '}
      element and the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        selected
      </code>{' '}
      attribute work correctly together.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        test how Lithent handles select onChange events and keeps the currently
        selected option in sync via the selected attribute
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      As you change each dropdown, the character preview updates in real time.
      Try the preset buttons or the randomize feature to explore different
      combinations.
    </p>

    <CodeBlock language="typescript" code={example8Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example8 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Core behavior of select elements
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>onChange events</strong>: handlers fire immediately when the
          user selects an option.
        </li>
        <li>
          <strong>selected attribute</strong>: set dynamically by comparing the
          current state value with each option&apos;s value.
        </li>
        <li>
          <strong>Two-way binding</strong>: the value prop controls the current
          selection, onChange detects changes.
        </li>
        <li>
          <strong>State synchronization</strong>: select controls stay in sync
          even when state is changed programmatically via presets or randomize.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key features
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Rich customization</strong>: configure face, hair, eyes,
          outfit, accessories, and background separately.
        </li>
        <li>
          <strong>Preset system</strong>: includes Developer, Pirate, Royalty,
          and Athlete presets.
        </li>
        <li>
          <strong>Randomize</strong>: generates a random character.
        </li>
        <li>
          <strong>Export</strong>: copies the character data as JSON to the
          clipboard.
        </li>
        <li>
          <strong>Live preview</strong>: updates the character immediately on
          select changes.
        </li>
        <li>
          <strong>Gradient backgrounds</strong>: uses Tailwind gradients to
          create different moods.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          Change options in each dropdown and confirm the preview updates.
        </li>
        <li>Click preset buttons and check that all selects update at once.</li>
        <li>
          Use Randomize and verify that each select shows the correct randomized
          value.
        </li>
        <li>
          Flip the same dropdown repeatedly to confirm the selected attribute
          stays in sync.
        </li>
        <li>Use Export and confirm the current state is copied as JSON.</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎨 Why emojis?
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300 mb-2">
        Plain numeric or text select examples can be boring. Emojis make it easy
        to see how select behavior works while keeping the demo visually fun.
      </p>
      <p class="text-xs text-purple-600 dark:text-purple-400 italic">
        💡 In real games or apps, avatar systems work similarly. You might use
        buttons or image pickers instead of selects, but the core logic is the
        same.
      </p>
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
              navigateTo('/guide/state');
            }}
          >
            State guide
          </a>{' '}
          - Details the core patterns for updating Character state when selects
          change.
        </li>
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/props');
            }}
          >
            Props guide
          </a>{' '}
          - Explains how to control DOM attributes like value/selected via
          props.
        </li>
      </ul>
    </div>
  </div>
);
