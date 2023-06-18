import { h, mount, mountCallback } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import hljs from 'highlight.js';
import 'highlight.js/styles/nord.css';

export const Guide = mount(r => {
  let exCode1 = '';
  const code = `import { h, Fragment, render, Renew, mount } from 'lithent';
const Renew = mount((renew, _props) => {<br>
  let count = 0;

  const change = () => {
    count1 += 1;
    renew();
  };

  return () => (
    <Fragment>
      <li>count: {count}</li>
      <button onClick={change}>increase</button>
    </Fragment>
  );
});

render(<Renew />, document.getElementById('root'));
`;

  mountCallback(() => {
    exCode1 = hljs.highlight(code, {
      language: 'javascript',
    }).value;
    r();
  });

  return () => (
    <div class="grid grid-cols-1 px-4 pt-6 xl:grid-cols-2 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="가이드" />

      {/*<!-- Right Content --> */}
      <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="px-4 py-1 text-gray-400 border border-gray-200 rounded dark:border-gray-600">
          <h3>컨셉</h3>
        </div>
        <div class="px-4 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div innerHTML={exCode1} style={{ whiteSpace: 'pre' }} />
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
