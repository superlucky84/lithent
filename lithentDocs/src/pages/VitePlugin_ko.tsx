import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const VitePluginKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Vite Plugin
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      @lithent/lithent-vite란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-vite
      </code>
      는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Lithent를 위한 공식 Vite 플러그인
      </strong>
      입니다.
      <br />
      <br />
      개발 중 Hot Module Replacement(HMR)를 활성화하여 컴포넌트 상태를 잃지 않고
      즉시 변경사항을 확인할 수 있습니다. 플러그인이 자동으로 HMR 경계를
      주입하여 원활한 개발 경험을 제공합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주요 기능
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Hot Module Replacement
            </strong>
            : 개발 중 즉각적인 업데이트
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              자동 HMR 경계
            </strong>
            : mount 컴포넌트를 자동으로 래핑
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              마커 지원
            </strong>
            : 주석으로 명시적 HMR 경계 제어
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              타입 안전
            </strong>
            : 완전한 TypeScript 지원
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              제로 설정
            </strong>
            : 합리적인 기본값으로 즉시 작동
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      설치
    </h2>

    <CodeBlock
      language="bash"
      code={`npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          📦 Peer Dependencies:
        </span>
        <br />• lithent: 1.x
        <br />• vite: 5.x
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 설정
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        vite.config.js
      </code>{' '}
      또는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        vite.config.ts
      </code>
      에 플러그인을 추가합니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin(),
  ],
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이것으로 끝입니다! 플러그인이 자동으로 Lithent 컴포넌트에 HMR을
      활성화합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      옵션 설정
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      플러그인 동작을 커스터마이징할 수 있습니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // 특정 파일 패턴 포함 (기본값: [/\\.([cm]?[tj]sx?)$/])
      include: /\\.tsx?$/,

      // 커스텀 HMR 경계 마커 (기본값: '/* lithent:hmr-boundary */')
      boundaryMarker: '/* lithent:hmr-boundary */',

      // 커스텀 import 지정자
      createBoundaryImport: 'lithent/devHelper',
      tagFunctionImport: 'lithent',

      // 프로덕션에서 devtools 활성화 (기본값: false)
      devtoolsInProd: false,

      // JSX import source (기본값: 'lithent')
      jsxImportSource: 'lithent',

      // HMR 변환 이전에 lithent-template-vite 사용
      template: {
        extensions: ['.ltsx'],
      },
    }),
  ],
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      주요 옵션
    </h3>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              옵션
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              타입
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              기본값
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              include
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              RegExp | RegExp[]
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              /\.([cm]?[tj]sx?)$/
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              변환할 파일 패턴
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              boundaryMarker
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              string
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              '/* lithent:hmr-boundary */'
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              HMR 경계 마커 문자열
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              jsxImportSource
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              string
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              'lithent'
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              자동 JSX 변환 소스
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              devtoolsInProd
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              boolean
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              false
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              프로덕션 devtools 활성화
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      동작 원리
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      자동 HMR 경계
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      플러그인은 자동으로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>
      를 사용하는 컴포넌트를 래핑합니다:
    </p>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      변환 전:
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">
      변환 후:
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createHmrBoundary } from 'lithent/devHelper';

const App = createHmrBoundary(
  mount((renew, props) => {
    return () => <div>Hello World</div>;
  }),
  import.meta.hot,
  'App'
);

export default App;`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createHmrBoundary
      </code>
      는 컴포넌트를 감싸서 HMR 업데이트 시 상태를 적절히 처리합니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      명시적 HMR 경계
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      마커 주석을 사용하여 세밀한 제어가 가능합니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        /* lithent:hmr-boundary default */
      </code>{' '}
      주석은 해당 파일의 default export에 명시적으로 HMR 경계를 추가합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      상태 보존 (모듈 단위 HMR)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        네이티브 클로저 기반 상태 관리
      </strong>
      를 사용하므로, HMR이{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        모듈(파일) 단위
      </strong>
      로 동작합니다:
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-3">
        <li>
          <strong>🔄 수정한 모듈:</strong> 코드를 수정한 파일(모듈) 전체의
          클로저 상태가 리셋됩니다
          <br />
          <span class="text-xs opacity-80">
            → 해당 파일의 모든 컴포넌트와 변수가 재생성되어 초기화됨
          </span>
        </li>
        <li>
          <strong>✅ 수정하지 않은 모듈:</strong> 다른 파일의 컴포넌트 상태는
          모두 유지됩니다
          <br />
          <span class="text-xs opacity-80">
            → 부모/자식/형제 컴포넌트가 다른 파일에 있다면 영향받지 않음
          </span>
        </li>
      </ul>
    </div>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>⚠️ 중요:</strong> HMR은 파일(모듈) 단위로 동작합니다. 한 파일에
        여러 컴포넌트가 있다면 그 중 하나만 수정해도 파일 전체가 교체되므로 모든
        컴포넌트의 상태가 리셋됩니다.
        <br />
        <br />
        <strong>⚠️ 외부 상태도 모듈 단위:</strong> lithent/helper의 state 또는
        store로 만들어진 외부 상태라도, 그 상태를 생성한 모듈이 HMR로 교체되면
        해당 상태도 함께 초기화됩니다. 상태가 정의된 모듈의 클로저 컨텍스트가
        재생성되기 때문입니다.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      React HMR과의 차이점
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      React는 컴포넌트 상태를 React의 상태 시스템에 저장하므로 HMR 시 보존이
      가능하지만, Lithent는 클로저 자체에 상태를 저장하므로 모듈이 재로드되면
      해당 모듈의 클로저가 재생성되어 상태도 리셋됩니다.
      <br />
      <br />
      이는 Lithent의{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        네이티브 JavaScript 클로저 기반 설계
      </strong>
      에서 비롯된 자연스러운 동작입니다. 개발 중 수정한 파일의 상태를 항상
      초기화하여 깨끗한 상태에서 테스트할 수 있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      실제 동작 예시
    </h3>

    <CodeBlock
      language="tsx"
      code={`// ParentComponent.tsx (파일 A)
import { mount } from 'lithent';

const Parent = mount((renew) => {
  let parentCount = 0; // 클로저 변수

  return () => (
    <div>
      <p>Parent Count: {parentCount}</p>
      <button onClick={() => { parentCount++; renew(); }}>
        Increment Parent
      </button>
      <Child />
    </div>
  );
});

// ChildComponent.tsx (파일 B)
import { mount } from 'lithent';

const Child = mount((renew) => {
  let childCount = 0; // 클로저 변수

  return () => (
    <div>
      <p>Child Count: {childCount}</p>
      <button onClick={() => {
        childCount++;
        renew();
      }}>
        Increment Child
      </button>
    </div>
  );
});

// HMR 시나리오:
// 1. ChildComponent.tsx (파일 B)를 수정한 경우:
//    - childCount: 리셋됨 (파일 B 전체 재로드)
//    - parentCount: 유지됨 (파일 A는 수정 안 함)

// 2. ParentComponent.tsx (파일 A)를 수정한 경우:
//    - parentCount: 리셋됨 (파일 A 전체 재로드)
//    - childCount: 유지됨 (파일 B는 수정 안 함)

// 3. 한 파일에 Parent와 Child가 함께 있는 경우:
//    - 둘 중 하나만 수정해도 파일 전체가 재로드되어
//    - parentCount, childCount 모두 리셋됨`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 개발 팁:
        </span>{' '}
        컴포넌트를 별도 파일로 분리하면, 한 컴포넌트를 수정할 때 다른 컴포넌트의
        상태가 유지됩니다. 이는 개발 중 더 나은 HMR 경험을 제공합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      SSR 설정 (Express/Node.js)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Vite 미들웨어와 함께 서버 사이드 렌더링을 사용하는 경우:
    </p>

    <CodeBlock
      language="javascript"
      code={`import express from 'express';
import { createServer as createViteServer } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

const app = express();

const vite = await createViteServer({
  plugins: [
    lithentVitePlugin(),
  ],
  server: { middlewareMode: 'ssr', hmr: true },
});

app.use(vite.middlewares);

// 서버 렌더링 라우트 추가
app.get('*', async (req, res) => {
  // SSR 로직...
});

app.listen(3000);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      문제 해결
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      HMR이 작동하지 않을 때
    </h3>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <ol class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2">
        <li>1. 플러그인이 다른 변환 플러그인보다 먼저 로드되는지 확인하세요</li>
        <li>2. 파일이 include 패턴과 일치하는지 확인하세요</li>
        <li>
          3. import.meta.hot이 사용 가능한지 확인하세요 (개발 모드에만 존재)
        </li>
      </ol>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      TypeScript 에러
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        tsconfig.json
      </code>
      에 Vite 클라이언트 타입을 추가하세요:
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      관련 패키지
    </h2>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <ul class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
        <li>
          <strong class="text-gray-700 dark:text-gray-300">
            @lithent/hmr-parser
          </strong>{' '}
          - 핵심 HMR 변환 로직
        </li>
        <li>
          <strong class="text-gray-700 dark:text-gray-300">lithent</strong> -
          Lithent 코어 라이브러리
        </li>
        <li>
          <strong class="text-gray-700 dark:text-gray-300">
            lithent/devHelper
          </strong>{' '}
          - 브라우저 사이드 HMR 런타임
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/jsx-manual"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/jsx-manual');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: Manual JSX Setup →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Vite 플러그인 없이 수동으로 JSX를 설정하는 방법을 알아보세요.
          <br />
          TypeScript와 Babel 설정 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
