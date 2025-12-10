import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const QuickStartKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      빠르게 시작하기
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Lithent 애플리케이션 생성하기
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📋 사전 준비사항
      </p>
      <ul class="space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>커맨드 라인 사용에 익숙할 것</span>
        </li>
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong class="font-medium text-gray-900 dark:text-white">
              Node.js 18.12
            </strong>{' '}
            이상 버전 설치
          </span>
        </li>
      </ul>
    </div>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 섹션에서는 로컬 컴퓨터에서 Lithent 애플리케이션을 생성하는 방법을
      소개합니다. 생성된 프로젝트는 Vite를 기반으로 한 빌드 환경을 사용합니다.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      최신 버전의 Node.js가 설치되어 있는지 확인하고, 현재 작업 디렉터리가
      프로젝트를 생성하려는 위치인지 확인하세요. 명령줄에서 다음 명령을
      실행하세요($ 기호는 입력하지 않습니다):
    </p>

    <CodeBlock language="bash" code={`$ npx create-lithent@latest`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 명령은 공식 Lithent 프로젝트 생성 도구인 create-lithent를 설치하고
      실행합니다.
      <br />
      <br />
      실행하면 프로젝트 이름과 템플릿 유형을 선택할 수 있습니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📦 템플릿 유형
      </p>
      <ul class="space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong class="font-medium text-gray-900 dark:text-white">
              SSR (Express)
            </strong>
            : 서버 사이드 렌더링을 지원하는 Express 기반 템플릿. SEO가
            중요하거나 초기 로딩 성능을 최적화하려는 경우에 적합합니다.
          </div>
        </li>
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong class="font-medium text-gray-900 dark:text-white">
              SPA (Vite)
            </strong>
            : 클라이언트 사이드 렌더링만 사용하는 Vite 기반 템플릿. 빠른 개발
            환경과 간단한 배포를 원하는 경우에 적합합니다.
          </div>
        </li>
      </ul>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      프로젝트가 생성되면, 의존성 설치 및 개발 서버 실행을 위한 안내에 따라
      진행하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`$ cd <your-project-name>
$ npm install
$ npm run dev`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이제 첫 번째 Lithent 프로젝트가 실행되고 있을 것입니다!
      <br />
      Lithent는 여러 가지 템플릿 스타일을 지원하지만, 기본 애플리케이션은 JSX를
      사용하여 생성됩니다.
      <br />
      <br />
      앱을 프로덕션에 배포할 준비가 되면 다음 명령을 실행하세요:
    </p>

    <CodeBlock language="bash" code={`$ npm run build`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 명령은 프로젝트의 ./dist 디렉터리에 프로덕션용 빌드를 생성합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      CDN에서 Lithent 사용하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      스크립트 태그를 통해 CDN에서 직접 Lithent를 사용할 수 있습니다:
    </p>
    <CodeBlock
      language="bash"
      code={`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      CDN에서 Lithent를 사용할 때는 빌드 단계가 필요하지 않습니다. 이로 인해
      설정이 훨씬 간단해지며, 정적 HTML을 보강하거나 백엔드 프레임워크와 통합할
      때 적합합니다.
      <br />
      <br />
      다만 JSX 문법은 사용할 수 없습니다. 대신 함수형으로 템플릿을 만드는 ftags
      방식을 사용하거나 htm을 사용할 수 있습니다.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      아래는 ftags를 사용한 예시입니다.
    </p>

    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example</title>
</head>
<body>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>

  <script>
    const { render } = lithent;
    const { lstate } = lithentHelper;
    const { fTags, flMount } = lithentFTags;
    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      예제에서는 flMount를 사용했지만 fMount를 사용할 수도 있습니다.
      <br />
      <br />
      fMount를 사용하면 lstate와 같은 확장 기능이 필요하지 않기 때문에 helper
      리소스를 별도로 로드하지 않아도 되므로, 더 적은 네트워크 비용으로 사용할
      수 있습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      브라우저에서 직접 로드하는 방식으로 사용할 때 ftags가 매우 유용합니다.
      <br />
      <br />
      ftags 외에도 htm을 이용하여 사용하는 방법이 있습니다. 이 방법은 다른
      섹션에서 더 자세히 설명하겠습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      ES 모듈 빌드 사용하기
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      ESM으로 빌드된 버전을 사용하면 ES 모듈 문법으로 사용할 수 있습니다.
      대부분의 최신 브라우저는 ES 모듈을 기본적으로 지원하므로, 다음과 같이
      CDN에서 네이티브 ES 모듈로 Lithent를 사용할 수 있습니다:
    </p>
    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example (ES Module)</title>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    import { render } from 'https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs';
    import { lstate } from 'https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs';
    import { fTags, flMount } from 'https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.mjs';

    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      보안상의 이유로, ES 모듈은 http:// 또는 https:// 프로토콜에서만
      동작합니다. 즉, 브라우저가 웹에서 페이지를 열 때 사용하는 프로토콜입니다.
      로컬 컴퓨터에서 ES 모듈을 사용하려면 파일을 직접 열지 말고(file://), 로컬
      HTTP 서버를 통해 제공해야 합니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      사용 가능한 CDN URL
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      모든 Lithent 패키지는 jsdelivr CDN을 통해 제공됩니다. UMD (script 태그용)
      또는 ESM (모듈 import용) 중에서 선택할 수 있습니다:
    </p>

    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          UMD 빌드 (script 태그)
        </h4>
        <ul class="space-y-2.5 text-xs">
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">코어</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">헬퍼</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">FTags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">HTM Tags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.umd.js
            </code>
          </li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          ESM 빌드 (ES 모듈)
        </h4>
        <ul class="space-y-2.5 text-xs">
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">코어</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">헬퍼</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">FTags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">HTM Tags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.mjs
            </code>
          </li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mounter"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mounter');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Mounter →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Lithent의 핵심 개념인 Mounter에 대해 알아보세요.
          <br />
          컴포넌트를 생성하고 초기화하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
