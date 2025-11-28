import { CodeBlock } from '@/components/CodeBlock';

export const QuickStart = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      빠르게 시작하기
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Lithent 싱글 페이지 애플리케이션 애플리케이션 생성하기
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
      이 섹션에서는 로컬 컴퓨터에서 Lithent의 애플리케이션을 스캐폴딩하는 방법을
      소개합니다. 생성된 프로젝트는 Vite를 기반으로 한 빌드 환경을 사용합니다.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      최신 버전의 Node.js가 설치되어 있는지 확인하고, 현재 작업 디렉터리가
      프로젝트를 생성하려는 위치인지 확인하세요. 커맨드 라인에서 다음 명령어를
      실행하세요($ 기호는 입력하지 않습니다):
    </p>

    <CodeBlock language="bash" code={`$ npx create-lithent@latest`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 명령어는 공식 Lithent 프로젝트 스캐폴딩 도구인 create-lithent를
      설치하고 실행합니다.
      <br />
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
      Lithent는 여러가지 템플릿 스타일을 지원하지만, 애플리케이션은 jsx를
      사용하여 생성됩니다.
      <br />
      <br />
      앱을 프로덕션에 배포할 준비가 되면 다음 명령어를 실행하세요:
    </p>

    <CodeBlock language="bash" code={`$ npm run build`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 명령어는 프로젝트의 ./dist 디렉터리에 프로덕션용 빌드를 생성합니다.
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

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Your First Component
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Create a simple counter component using Lithent's closure-based pattern:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { h, mount, render } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0);

  const increment = () => {
    count.value++;
    renew();
  };

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  );
});

render(<Counter />, document.getElementById('root'));`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      JSX Configuration
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Configure your{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
        tsconfig.json
      </code>{' '}
      for JSX support:
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

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Component with Props
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Create components that accept props:
    </p>

    <CodeBlock
      language="tsx"
      code={`const Greeting = mount<{ name: string }>((renew, props) => {
  return () => (
    <div>
      <h1>Hello, {props.name}!</h1>
    </div>
  );
});

render(<Greeting name="World" />, document.getElementById('root'));`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Using Lifecycle Hooks
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Lithent provides lifecycle hooks for side effects:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mountCallback } from 'lithent';

const Component = mount((renew) => {
  mountCallback(() => {
    console.log('Component mounted!');

    // Cleanup function
    return () => {
      console.log('Component unmounted!');
    };
  });

  return () => <div>Hello!</div>;
});`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      SSR Setup
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Use the SSR boilerplate generator for server-side rendering:
    </p>

    <CodeBlock
      language="bash"
      code={`npx create-lithent-ssr@latest my-app
cd my-app
pnpm install
pnpm dev`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Next Steps
    </h2>

    <div class="bg-[#42b883] bg-opacity-10 border border-[#42b883] rounded-lg p-6 mb-6">
      <p class="text-sm md:text-base text-gray-900 dark:text-white font-medium mb-3">
        You're now ready to build with Lithent!
      </p>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>Explore more examples in the documentation</li>
        <li>Learn about state management with helpers</li>
        <li>Check out the GitHub repository for more resources</li>
      </ul>
    </div>
  </div>
);
