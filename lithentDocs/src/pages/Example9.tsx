import { CodeBlock } from '@/components/CodeBlock';
import { Example9 } from '@/components/examples/example9';
import type { Introduction } from '@/pages/Introduction';

const example9Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
}

const CardGenerator = mount(r => {
  const card = state<BusinessCard>({
    name: 'Your Name',
    title: 'Your Title',
    company: 'Your Company',
    email: 'email@example.com',
  }, r);

  const updateField = (field: keyof BusinessCard, value: string) => {
    card.v = { ...card.v, [field]: value };
  };

  return () => (
    <>
      {/* Card Preview */}
      <div class="card-preview">
        <h2>{card.v.name}</h2>
        <p>{card.v.title}</p>
        <p>{card.v.company}</p>
        <p>{card.v.email}</p>
      </div>

      {/* Input Fields */}
      <input
        type="text"
        value={card.v.name}
        onInput={(e) => updateField('name', e.target.value)}
        placeholder="Enter your name"
      />

      <input
        type="email"
        value={card.v.email}
        onInput={(e) => updateField('email', e.target.value)}
        placeholder="your@email.com"
      />
    </>
  );
});
`;

export const Example9Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Input Controls (Business Card Generator)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This real-time business card generator demonstrates how{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input&gt;
      </code>{' '}
      and{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;textarea&gt;
      </code>{' '}
      elements behave when controlled by state.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        test how Lithent handles input/textarea{' '}
        <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
          onInput
        </code>{' '}
        events and two-way binding via the{' '}
        <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
          value
        </code>{' '}
        attribute
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      As you type into each input field, the card preview updates instantly. Try
      loading a template or entering your own data.
    </p>

    <CodeBlock language="typescript" code={example9Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example9 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Core behavior of input elements
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>onInput events</strong>: fire on every keystroke for a highly
          responsive UI.
        </li>
        <li>
          <strong>Value binding</strong>: use the value prop to implement
          two-way binding.
        </li>
        <li>
          <strong>Multiple input types</strong>: supports text, email, tel, url,
          and more.
        </li>
        <li>
          <strong>Textarea support</strong>: multi-line inputs behave the same
          way.
        </li>
        <li>
          <strong>Live sync</strong>: all fields update immediately when a
          template is loaded.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key features
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Seven input fields</strong>: Name, Title, Company, Email,
          Phone, Website, Bio.
        </li>
        <li>
          <strong>Template system</strong>: Developer, Designer, and
          Entrepreneur presets.
        </li>
        <li>
          <strong>Four themes</strong>: Modern, Classic, Minimal, and Vibrant
          styles.
        </li>
        <li>
          <strong>Live preview</strong>: the card updates with each keystroke.
        </li>
        <li>
          <strong>Reset</strong>: clear all fields at once.
        </li>
        <li>
          <strong>Export</strong>: export card data as JSON.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>Type into each input field and confirm the preview updates.</li>
        <li>Use Template buttons to fill all fields at once.</li>
        <li>
          Check that special input types like Email and Phone behave correctly.
        </li>
        <li>
          Enter multi-line text in the textarea and observe the line clamp
          behavior.
        </li>
        <li>Switch themes and confirm card styles update immediately.</li>
        <li>Use Reset and confirm all fields return to their initial state.</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        💼 A practical example
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        This card generator is more than a demo—it can be used as a real tool,
        for example as a digital card at networking events or as a profile card
        in your email signature.
      </p>
      <p class="text-xs text-green-600 dark:text-green-400 italic">
        💡 In a production app, you&apos;d typically add input validation (email
        format, phone format, etc.) and sanitization. You could also export the
        card design as an image or PDF.
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Input vs onChange vs onInput
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300">
        Lithent recommends using{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onInput
        </code>
        . While{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onChange
        </code>{' '}
        only fires when the field loses focus,{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onInput
        </code>{' '}
        fires on every keystroke, making the UI feel much more responsive.
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
              window.history.pushState({}, '', '/guide/state');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State guide
          </a>{' '}
          - Explains how to manage card fields as state while preserving
          immutability.
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
          - Covers patterns for using form controls like value/onInput in
          controlled components.
        </li>
      </ul>
    </div>
  </div>
);
