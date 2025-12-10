import { mount, render, ref, mountCallback } from 'lithent';
import { store } from 'lithent/helper';

const assignSharedStore = store<{ text: string }>({
  text: 'Multiple components share this text',
});

const Writer = mount(renew => {
  const shared = assignSharedStore(renew, s => [s.text]);
  const onInput = (e: InputEvent) => {
    shared.text = (e.target as HTMLTextAreaElement).value;
  };
  return () => (
    <textarea
      onInput={onInput}
      value={shared.text}
      class="w-full h-32 px-4 py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
      placeholder="Type your shared text here..."
    />
  );
});

export const Example2 = mount(() => {
  const slot1Ref = ref<null | HTMLElement>(null);
  const slot2Ref = ref<null | HTMLElement>(null);

  mountCallback(() => {
    if (slot1Ref.value) {
      render(<Writer />, slot1Ref.value);
    }
    if (slot2Ref.value) {
      render(<Writer />, slot2Ref.value);
    }
  });

  return () => (
    <div class="space-y-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm md:text-base text-blue-800 dark:text-blue-200">
          💡 Both textareas share the same store. Editing one will automatically
          update the other.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Writer component #1
            </h4>
          </div>
          <div ref={slot1Ref}></div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Writer component #2
            </h4>
          </div>
          <div ref={slot2Ref}></div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📌 Key ideas
        </h4>
        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            •{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              store()
            </code>{' '}
            creates shared state
          </li>
          <li>
            • Each component subscribes with{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              assignSharedStore(renew)
            </code>
          </li>
          <li>• Updating the value in one place updates all subscribers</li>
        </ul>
      </div>
    </div>
  );
});
