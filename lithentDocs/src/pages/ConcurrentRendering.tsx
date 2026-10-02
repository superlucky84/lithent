import { CodeBlock } from '@/components/CodeBlock';
import { ConcurrentDemo } from '@/components/ConcurrentDemo';
import { navigateTo } from '@/store';

const copy = {
  en: {
    title: 'Concurrent Rendering',
    intro:
      'lithent-concurrent is a separate rendering build for screens with expensive component trees. It schedules urgent work first and can pause low-priority builds between units of work. Use the base lithent core for ordinary screens and small interactive islands. In a 2026-10-02 browser measurement of typing into a filter, a 5,000-row list cut input-to-paint latency from about 134 ms to 27 ms. At 1,000 rows both fit in a frame, at 10,000 rows the gain nearly vanished, and at 20,000 rows deferring was slower. Commits cannot be split, so measure your own screen.',
    install: 'Install and select the core',
    setup:
      'Keep lithent installed for JSX, helper and SSR subpaths. Match the core import exactly: a prefix alias would also rewrite lithent/helper and lithent/jsx-runtime. In library builds that externalize the core, keep the package-name replacement.',
    types:
      'Import new APIs from lithent-concurrent so TypeScript resolves their declarations. Existing component imports can stay as lithent under the runtime alias. The same alias must apply to server and client builds when using SSR.',
    scope: 'deferRender(scope)',
    semantics:
      'The scope runs synchronously and writes values immediately; only the resulting render is deferred. Keep urgent input state and the heavy list in different components. A synchronous render of the same component reads the new deferred value and absorbs its queued work.',
    async:
      'The priority scope ends when the callback returns. Wrap updates after an await in a new deferRender call. Expensive computations inside the callback itself still block; the scheduler slices rendering work, not arbitrary JavaScript.',
    idle: 'nextTick and whenIdle',
    wait: 'nextTick waits for synchronous commits. It does not drain the low-priority lane. whenIdle resolves when that lane is empty; it does not wait for network requests or browser paint. A waiting low-priority update keeps its previous DOM until commit, provided that component does not also receive a synchronous update.',
    demo: 'Try deferred rendering',
    demoText:
      'Type a query. The input and list are separate components using the concurrent core. The recorded nextTick value shows the previous list; whenIdle shows the completed list. This small example demonstrates ordering, rather than a performance benchmark.',
    compatibility: 'Lifecycle and compatibility',
    behavior: [
      'Mount callbacks observe the complete commit, including newly inserted siblings. Their relative order stays child to parent; unmount cleanup stays parent to child.',
      'updateCallback bodies run during the build; returned functions run after that commit. A returned update function is not an unmount cleanup.',
      'Only low-priority build work can pause. DOM commit is synchronous and atomic. Queued updates may merge, but already committed intermediate values are not retroactively hidden.',
      'Builds that mount components or run update callbacks are completed instead of discarded. Mounters are currently invoked once per committed component.',
      'There are no lane-specific state snapshots, Suspense or use() API. Throwing a Promise is an ordinary exception, not render suspension.',
    ],
    pending: 'Advanced pending query',
    pendingText:
      'hasPending(compKey, lane?) is a low-level query. Capture the component key in its mounter. For a component-local low-priority query, use hasPendingRender from the helper guide; neither query schedules a render.',
    helperLink: 'Deferred state helpers →',
    nextLink: 'nextTick guide →',
  },
  ko: {
    title: 'Concurrent 렌더링',
    intro:
      'lithent-concurrent는 큰 컴포넌트 트리를 다루는 별도 렌더링 빌드입니다. 급한 갱신을 먼저 처리하고 저우선순위 빌드를 작업 단위 사이에서 중단·재개합니다. 일반적인 화면이나 작은 인터랙티브 영역에는 기본 lithent 코어를 사용하세요. 2026-10-02 브라우저 실측(필터 입력 중 목록 갱신)에서 5,000행은 입력→페인트 지연이 약 134ms에서 27ms로 줄었습니다. 1,000행은 둘 다 한 프레임 안이라 차이가 작고, 10,000행에서는 이득이 거의 사라졌으며, 20,000행에서는 오히려 느렸습니다. 커밋은 쪼갤 수 없으니 실제 화면에서 직접 측정하세요.',
    install: '설치와 코어 선택',
    setup:
      'JSX·helper·SSR 서브패스를 위해 lithent도 설치합니다. 코어 이름만 정확히 매칭하세요. 접두사 alias는 lithent/helper와 lithent/jsx-runtime까지 바꿉니다. 코어를 external로 두는 라이브러리 빌드에서는 패키지 이름을 replacement로 유지합니다.',
    types:
      '새 API는 lithent-concurrent에서 import하면 TypeScript가 타입 선언을 해석합니다. 기존 컴포넌트의 lithent import는 런타임 alias로 유지할 수 있습니다. SSR에서는 서버와 클라이언트 빌드에 같은 alias를 적용해야 합니다.',
    scope: 'deferRender(scope)',
    semantics:
      'scope는 동기로 실행되고 값도 즉시 변경됩니다. 미뤄지는 것은 렌더뿐입니다. 급한 입력 상태와 무거운 목록은 서로 다른 컴포넌트에 두세요. 같은 컴포넌트에 동기 갱신이 들어오면 새 값이 바로 보이고 대기 중인 갱신도 흡수됩니다.',
    async:
      '우선순위 범위는 콜백이 반환되면 끝납니다. await 뒤의 갱신은 새 deferRender로 감싸세요. 콜백 안의 무거운 계산 자체는 여전히 메인 스레드를 막습니다. 스케줄러가 나누는 대상은 렌더 작업입니다.',
    idle: 'nextTick과 whenIdle',
    wait: 'nextTick은 동기 커밋을 기다리며 저우선순위 레인을 비우지 않습니다. whenIdle은 저우선순위 레인이 비면 완료되고 네트워크 요청이나 브라우저 페인트까지 기다리지는 않습니다. 같은 컴포넌트에 동기 갱신이 없다면 미룬 갱신이 커밋되기 전까지 이전 DOM을 유지합니다.',
    demo: '미룬 렌더 직접 실행하기',
    demoText:
      '검색어를 입력하세요. 입력과 목록은 별도 컴포넌트이며 concurrent 코어로 실행됩니다. 기록된 nextTick 값은 이전 목록, whenIdle 값은 갱신된 목록입니다. 이 작은 예제는 실행 순서를 보여주며 성능 벤치마크가 아닙니다.',
    compatibility: '라이프사이클과 호환성',
    behavior: [
      'mountCallback은 새 형제까지 포함한 완성된 커밋을 관찰합니다. 마운트 콜백의 상대 순서는 자식→부모, 언마운트 정리는 부모→자식입니다.',
      'updateCallback 본문은 빌드 중에, 반환 함수는 그 커밋 뒤에 실행됩니다. updateCallback 반환 함수는 언마운트 정리가 아닙니다.',
      '중단 가능한 것은 저우선순위 빌드뿐이며 DOM 커밋은 동기·원자적입니다. 대기 중인 갱신은 병합될 수 있지만 이미 커밋된 중간 값을 되돌려 숨기지는 않습니다.',
      '컴포넌트를 마운트했거나 updateCallback을 실행한 빌드는 폐기하지 않고 끝까지 처리합니다. 현재 mounter는 커밋되는 컴포넌트마다 한 번 실행됩니다.',
      '레인별 상태 사본, Suspense, use() API는 제공하지 않습니다. 렌더 중 Promise를 던지면 일반 예외로 처리됩니다.',
    ],
    pending: '저수준 pending 조회',
    pendingText:
      'hasPending(compKey, lane?)는 저수준 조회입니다. 컴포넌트 키는 mounter에서 얻습니다. 컴포넌트의 저우선순위 대기 여부는 helper 가이드의 hasPendingRender로도 조회할 수 있으며, 어느 쪽도 스스로 렌더를 예약하지 않습니다.',
    helperLink: '미룬 상태 헬퍼 →',
    nextLink: 'nextTick 가이드 →',
  },
};

export const ConcurrentGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <h2>{t.install}</h2>
      <CodeBlock
        language="bash"
        code="npm install lithent@^1.22.1 lithent-concurrent@^0.1.0"
      />
      <p>{t.setup}</p>
      <CodeBlock
        language="typescript"
        code={`// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'lithent' },
  resolve: {
    alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
  },
});`}
      />
      <p>{t.types}</p>
      <h2>{t.scope}</h2>
      <p>{t.semantics}</p>
      <CodeBlock
        language="tsx"
        code={`import { mount, deferRender } from 'lithent-concurrent';

let updateList: (query: string) => void = () => {};

// With the core alias above; this component owns only the list.
const HeavyList = mount(renew => {
  let query = 'initial';
  updateList = next => {
    deferRender(() => {
      query = next;
      renew();
    });
  };
  return () => <ul>{Array.from({ length: 300 }, (_, i) => (
    <li key={i}>{query}:{i}</li>
  ))}</ul>;
});

const Input = mount(renew => {
  let query = '';
  return () => <input value={query} onInput={(event: Event) => {
    query = (event.target as HTMLInputElement).value;
    updateList(query);
    renew(); // Only the input component gets a synchronous render.
  }} />;
});

export const App = mount(() => () => <><Input /><HeavyList /></>);`}
      />
      <p>{t.async}</p>
      <h2>{t.idle}</h2>
      <p>{t.wait}</p>
      <CodeBlock
        language="typescript"
        code={`import { deferRender, nextTick, whenIdle } from 'lithent-concurrent';

async function updateList(renew: () => boolean) {
  deferRender(() => { renew(); });
  await nextTick(); // Synchronous commits only.
  await whenIdle(); // Deferred renders have committed.
}`}
      />
      <h2>{t.demo}</h2>
      <p>{t.demoText}</p>
      <ConcurrentDemo language={language} />
      <h2>{t.compatibility}</h2>
      <ul>
        {t.behavior.map(text => (
          <li>{text}</li>
        ))}
      </ul>
      <h2>{t.pending}</h2>
      <p>{t.pendingText}</p>
      <CodeBlock
        language="typescript"
        code={`import { getComponentKey, hasPending } from 'lithent-concurrent';

// Inside the mounter:
const key = getComponentKey();
const readPending = () => key ? hasPending(key, 'low') : false;`}
      />
      <p>
        <a
          href="#/guide/concurrent-helpers"
          onClick={(event: Event) => {
            event.preventDefault();
            navigateTo('/guide/concurrent-helpers');
          }}
        >
          {t.helperLink}
        </a>
      </p>
      <p>
        <a
          href="#/guide/next-tick"
          onClick={(event: Event) => {
            event.preventDefault();
            navigateTo('/guide/next-tick');
          }}
        >
          {t.nextLink}
        </a>
      </p>
    </div>
  );
};

export const ConcurrentRendering = () => <ConcurrentGuide language="en" />;
