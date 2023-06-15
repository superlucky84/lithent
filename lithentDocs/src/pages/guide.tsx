import { h, mount, ref } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';

export const Guide = mount(() => {
  const editorEl = ref<HTMLElement | null>(null);

  return () => (
    <div class="grid grid-cols-1 px-4 pt-6 xl:grid-cols-2 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="가이드" />

      {/*<!-- Right Content --> */}
      <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="px-4 py-1 text-gray-400 border border-gray-200 rounded dark:border-gray-600">
          <h3>컨셉</h3>
        </div>
        <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div ref={editorEl}>
            <p>Hello World!</p>
            <p>
              Some initial <strong>bold</strong> text
            </p>
            <p>
              <br />
            </p>
          </div>
          <h3>코드</h3>
        </div>
        <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>코드2</h3>
        </div>
      </div>
      <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="h-full px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <p>코드</p>
          <p calss="mt-2">코드al;sdkgjlsave</p>
          <p class="mt-2">
            코드al;sdkgjlsavelsevkjsalejgslaeigisjvisjaegja;sleghjas
            liejglasijevilajwelg jawlejalwehjlawjsleghjasliejglasijevil
            ajwelgjawlejalwehjlaw jee
          </p>
          <p class="mt-2">
            코드al;sdkgjlsavelsevkjsalejgslaeigisjvisjaegja;sleghjas
            liejglasijevilajwelg jawlejalwehjlawjsleghjasliejglasijevil
            ajwelgjawlejalwehjlaw jee
          </p>
          <p class="mt-2">
            코드al;sdkgjlsavelsevkjsalejgslaeigisjvisjaegja;sleghjas
            liejglasijevilajwelg jawlejalwehjlawjsleghjasliejglasijevil
            ajwelgjawlejalwehjlaw jee
          </p>
          <p class="mt-2">
            코드al;sdkgjlsavelsevkjsalejgslaeigisjvisjaegja;sleghjas
            liejglasijevilajwelg jawlejalwehjlawjsleghjasliejglasijevil
            ajwelgjawlejalwehjlaw jee
          </p>
        </div>
      </div>
      <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>제목3</h3>
        </div>
        <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>코드</h3>
        </div>
        <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>설명</h3>
        </div>
      </div>
      <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>제목4</h3>
        </div>
        <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>코드</h3>
        </div>
        <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <h3>설명</h3>
        </div>
      </div>
    </div>
  );
});
