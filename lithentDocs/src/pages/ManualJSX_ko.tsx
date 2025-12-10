import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ManualJSXKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Manual JSX Setup
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      개요
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Vite 플러그인을 사용하지 않고 직접 JSX를 설정하는 방법을 안내합니다.
      <br />
      <br />
      TypeScript, Babel, Vite(esbuild) 등 다양한 도구에서 Lithent의 JSX를 사용할
      수 있도록 설정할 수 있습니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 언제 Manual Setup이 필요한가요?</span>
        <br />
        <br />• Vite를 사용하지 않는 프로젝트
        <br />• Babel 기반 빌드 시스템 (Create React App, Next.js 등)
        <br />• TypeScript만으로 빌드하는 환경
        <br />• 커스텀 빌드 파이프라인
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      JSX 변환 방식
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      JSX는 JavaScript의 확장 문법으로, 브라우저가 직접 이해할 수 없습니다.
      따라서 빌드 도구가 JSX를 일반 JavaScript로 변환해야 합니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Classic Transform (전통적 변환)
    </h3>

    <CodeBlock
      language="tsx"
      code={`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Classic)
import { h } from 'lithent';
const element = h('div', { className: 'box' }, 'Hello');`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Classic 방식은{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        h
      </code>{' '}
      함수를 명시적으로 호출합니다. React의 React.createElement와 동일한
      패턴입니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Automatic Transform (자동 변환)
    </h3>

    <CodeBlock
      language="tsx"
      code={`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Automatic)
import { jsx as _jsx } from 'lithent/jsx-runtime';
const element = _jsx('div', { className: 'box', children: 'Hello' });`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Automatic 방식은 JSX runtime을 자동으로 import하며, 파일 상단에{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        import &#123; h &#125;
      </code>
      를 작성할 필요가 없습니다.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 권장 사항:
        </span>{' '}
        TypeScript 4.1.1 이상을 사용한다면{' '}
        <strong class="text-gray-700 dark:text-gray-300">
          Automatic Transform
        </strong>
        을 권장합니다. 코드가 더 깔끔하고 import 문을 자동으로 처리합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript 설정
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      방법 1: Automatic Transform (권장)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      TypeScript 4.1.1 이상에서 사용 가능한 자동 JSX 변환 방식입니다.
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "react-jsx"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              새로운 JSX 변환 방식 활성화. JSX를 자동으로 <code>_jsx()</code>{' '}
              함수 호출로 변환
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxImportSource
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX runtime을 가져올 패키지 지정. <code>lithent/jsx-runtime</code>
              에서 자동으로 import
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      장점
    </h4>

    <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>
          매 파일마다{' '}
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            import &#123; h, Fragment &#125; from 'lithent'
          </code>{' '}
          작성 불필요
        </div>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>더 작은 번들 크기 (사용되는 함수만 import)</div>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>최신 React 생태계와 호환</div>
      </li>
    </ul>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      방법 2: Classic Transform
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      전통적인 JSX 변환 방식입니다. 모든 TypeScript 버전에서 사용 가능합니다.
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "react"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Classic JSX 변환 활성화. JSX를 factory 함수 호출로 변환
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX 요소를 변환할 함수 이름. Lithent는 <code>h</code> 함수 사용
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFragmentFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Fragment 요소를 변환할 함수 이름. Lithent는 <code>Fragment</code>{' '}
              사용
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      사용 예시
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { h, Fragment, mount } from 'lithent';

const App = mount((renew) => {
  return () => (
    <Fragment>
      <div>Hello</div>
      <div>World</div>
    </Fragment>
  );
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>⚠️ 주의:</strong> Classic Transform 사용 시 매 파일마다{' '}
        <code class="px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm">
          import &#123; h, Fragment &#125;
        </code>
        를 작성해야 합니다. 작성하지 않으면{' '}
        <code class="px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm">
          h is not defined
        </code>{' '}
        에러가 발생합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Babel 설정
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Babel을 사용하는 프로젝트에서 Lithent JSX를 설정하는 방법입니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Classic Transform
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                pragma
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX 요소를 생성할 함수 이름. 기본값은{' '}
              <code>React.createElement</code>, Lithent는 <code>h</code>
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                pragmaFrag
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Fragment 컴포넌트 이름. 기본값은 <code>React.Fragment</code>,
              Lithent는 <code>Fragment</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Automatic Transform
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                runtime: "automatic"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              새로운 JSX 변환 활성화. JSX runtime을 자동으로 import
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                importSource
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX runtime 패키지 지정. <code>lithent/jsx-runtime</code>에서
              import
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Vite 설정 (esbuild)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Vite 플러그인 없이 esbuild의 JSX 설정만 사용하는 방법입니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        주의:
      </strong>{' '}
      이 방식은 HMR을 지원하지 않습니다. HMR이 필요하다면{' '}
      <a
        href="/guide/vite-plugin"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/vite-plugin');
        }}
        class="text-[#42b883] hover:underline"
      >
        @lithent/lithent-vite
      </a>{' '}
      플러그인을 사용하세요.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              esbuild의 JSX factory 함수. <code>&lt;div /&gt;</code>를{' '}
              <code>h('div')</code>로 변환
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFragment
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              esbuild의 Fragment 컴포넌트. <code>&lt;&gt;&lt;/&gt;</code>를{' '}
              <code>Fragment</code>로 변환
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        esbuild는 현재 Automatic Transform을 지원하지 않습니다. Classic
        Transform만 사용 가능합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript + Babel 조합
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      TypeScript로 타입 체크만 하고, Babel로 실제 변환을 수행하는 설정입니다.
      <br />
      Next.js, Create React App 등에서 주로 사용하는 패턴입니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      tsconfig.json
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "preserve"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX 구문을 그대로 유지하고 변환하지 않음. Babel이 나중에 변환
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              타입 체크용. TypeScript가 <code>h</code>가 유효한 factory임을 인식
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      .babelrc
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "presets": [
    "@babel/env",
    ["@babel/typescript", { "jsxPragma": "h" }]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설정
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                @babel/typescript
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              TypeScript 파일 처리. <code>jsxPragma: "h"</code>로 factory 지정
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                @babel/transform-react-jsx
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX를 JavaScript로 변환. <code>pragma</code>와{' '}
              <code>pragmaFrag</code> 설정
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      문제 해결
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      "h is not defined" 에러
    </h3>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <strong>원인:</strong> Classic Transform 사용 시{' '}
        <code class="px-2 py-1 bg-red-700 dark:bg-red-600 rounded text-sm">
          h
        </code>{' '}
        함수를 import하지 않았습니다.
      </p>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      해결 방법 1: h 함수 import
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { h, Fragment } from 'lithent';

const App = () => <div>Hello</div>;`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      해결 방법 2: Automatic Transform 사용
    </h4>

    <CodeBlock
      language="json"
      code={`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}

// 이제 import 없이 사용 가능
const App = () => <div>Hello</div>;`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      TypeScript 타입 에러
    </h3>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>증상:</strong> JSX 요소에 빨간 밑줄이 생기고 "JSX element
        implicitly has type 'any'" 에러가 발생합니다.
      </p>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      해결 방법: 타입 정의 추가
    </h4>

    <CodeBlock
      language="typescript"
      code={`// src/jsx.d.ts 파일 생성
import 'lithent';

declare module 'lithent' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      또는 tsconfig.json에 lithent 타입을 포함:
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "types": ["lithent"]
  }
}`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      권장 설정 요약
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        현대적인 TypeScript 프로젝트
      </h3>
      <CodeBlock
        language="json"
        code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}
      />
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Vite 프로젝트 (HMR 필요)
      </h3>
      <CodeBlock
        language="typescript"
        code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [lithentVitePlugin()],
});`}
      />
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Babel 프로젝트
      </h3>
      <CodeBlock
        language="json"
        code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}
      />
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/ftags"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/ftags');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: FTags →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          JSX 없이 함수형 API로 컴포넌트를 작성하는 FTags를 알아보세요.
          <br />
          빌드 도구 설정 없이 즉시 사용 가능합니다.
        </p>
      </a>
    </div>
  </div>
);
