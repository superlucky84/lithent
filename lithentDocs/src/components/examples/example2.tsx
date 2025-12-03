import { mount, render, ref, mountCallback } from 'lithent';
import { store } from 'lithent/helper';

const assignSharedStore = store<{ text: string }>({
  text: '여러 컴포넌트가 이 텍스트를 공유합니다',
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
      placeholder="여기에 텍스트를 입력하세요..."
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
          💡 두 개의 textarea가 동일한 store를 공유합니다. 한 쪽에서 텍스트를
          수정하면 다른 쪽도 자동으로 업데이트됩니다.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Writer 컴포넌트 #1
            </h4>
          </div>
          <div ref={slot1Ref}></div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Writer 컴포넌트 #2
            </h4>
          </div>
          <div ref={slot2Ref}></div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📌 핵심 개념
        </h4>
        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            •{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              store()
            </code>
            로 공유 상태 생성
          </li>
          <li>
            • 각 컴포넌트에서{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              assignSharedStore(renew)
            </code>
            로 구독
          </li>
          <li>• 한 곳에서 값 변경 시 모든 구독자가 자동 업데이트</li>
        </ul>
      </div>
    </div>
  );
});
