// Official js-framework-benchmark results (Chrome 158, keyed), checked on
// 2026-11-23. Source and per-benchmark numbers:
// docs/benchmark/OFFICIAL_LISTING.md
const RESULTS_URL =
  'https://krausest.github.io/js-framework-benchmark/2026/chrome158.html';
const NOTE_URL =
  'https://github.com/krausest/js-framework-benchmark/issues/1261';

const rows: [string, string, string, string][] = [
  ['Lithent 1.25.9', '1.28', '52.4', '5.9'],
  ['Lit 3.2.0', '1.27', '58.6', '7.3'],
  ['Vue 3.5.39', '1.29', '94.8', '23.3'],
  ['Preact 11.0.0 (classes)', '1.31', '53.1', '6.2'],
  ['React 19.2.0 (hooks)', '1.55', '228.9', '51.4'],
];

const copy = {
  en: {
    head: [
      'Implementation',
      'CPU score (lower is faster)',
      'First paint (ms)',
      'Transfer size (kB, compressed)',
    ],
    intro: 'In the official',
    introAfter:
      'results (Chrome 158, keyed implementations), Lithent sits with Lit, Vue and Preact and well ahead of React:',
    note: [
      'The CPU score is the weighted geometric mean the results page shows: how much slower than the fastest implementation, averaged over the nine CPU benchmarks. Lithent ranks 96th of 214 keyed implementations. First paint and size are medians of the published samples for each benchmark app. The Lithent entry carries note ',
      ' (manual caching of (v)dom nodes) because its rows use ',
      '.',
    ],
  },
  ko: {
    head: [
      '구현',
      'CPU 점수 (낮을수록 빠름)',
      '첫 페인트 (ms)',
      '전송 크기 (kB, 압축)',
    ],
    intro: '공식',
    introAfter:
      '결과(Chrome 158, keyed 구현)에서 Lithent는 Lit·Vue·Preact와 같은 층에 있고 React보다 확실히 빠릅니다.',
    note: [
      'CPU 점수는 결과 페이지에 표시된 가중 기하평균입니다. 9개 CPU 항목에서 가장 빠른 구현보다 몇 배 느린지를 평균한 값이며, Lithent는 keyed 구현 214개 중 96위입니다. 첫 페인트와 크기는 각 벤치마크 앱의 공개 표본 중앙값입니다. Lithent 항목에는 행에 ',
      '를 쓰기 때문에 주석 ',
      '((v)dom 노드 수동 캐싱)가 붙어 있습니다.',
    ],
  },
};

const cell =
  'border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300';
const link = 'text-[#42b883] hover:underline';

export const BenchmarkTable = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  const resultsLink = (
    <a
      href={RESULTS_URL}
      target="_blank"
      rel="noopener noreferrer"
      class={link}
    >
      js-framework-benchmark
    </a>
  );
  const noteLink = (
    <a href={NOTE_URL} target="_blank" rel="noopener noreferrer" class={link}>
      #1261
    </a>
  );
  const cacheUpdate = <code>cacheUpdate</code>;
  return (
    <div class="mb-6">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {t.intro} {resultsLink} {t.introAfter}
      </p>
      <div class="overflow-x-auto mb-4">
        <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              {t.head.map((text, index) => (
                <th
                  class={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white ${index === 0 ? 'text-left' : 'text-right'}`}
                >
                  {text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr>
                {row.map((text, index) => (
                  <td
                    class={
                      index === 0 ? cell : `${cell} text-right tabular-nums`
                    }
                  >
                    {row[0].startsWith('Lithent') ? (
                      <strong>{text}</strong>
                    ) : (
                      text
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {language === 'en' ? (
          <>
            {t.note[0]}
            {noteLink}
            {t.note[1]}
            {cacheUpdate}
            {t.note[2]}
          </>
        ) : (
          <>
            {t.note[0]}
            {cacheUpdate}
            {t.note[1]}
            {noteLink}
            {t.note[2]}
          </>
        )}
      </p>
    </div>
  );
};
