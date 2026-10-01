import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ConcurrentHelpersGuide = ({
  language,
}: {
  language: 'en' | 'ko';
}) => {
  const ko = language === 'ko';
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{ko ? '미룬 상태 헬퍼' : 'Deferred State Helpers'}</h1>
      <p>
        {ko
          ? 'lithent-concurrent/helper는 저우선순위 렌더를 예약하는 상태 헬퍼입니다. 별도 패키지 설치 없이 lithent-concurrent에 포함됩니다. 일반 state·store·context는 기존 lithent/helper에서 가져옵니다.'
          : 'lithent-concurrent/helper provides state helpers that schedule low-priority rendering. The subpath ships inside lithent-concurrent. Continue importing ordinary state, store and context from lithent/helper.'}
      </p>
      <CodeBlock
        language="typescript"
        code={`import { deferred, ldeferred, hasPendingRender } from 'lithent-concurrent/helper';
import type { State, Computed } from 'lithent-concurrent/helper';`}
      />
      <h2>deferred(value, renew)</h2>
      <p>
        {ko
          ? 'mount의 renew를 전달합니다. value와 v는 같은 값을 읽고 쓰며, setter는 값을 즉시 바꾼 뒤 저우선순위 렌더를 예약합니다.'
          : 'Pass the renew function from mount. value and v read and write the same value. Setters change it immediately and then schedule a low-priority render.'}
      </p>
      <CodeBlock
        language="tsx"
        code={`import { mount } from 'lithent-concurrent';
import { deferred } from 'lithent-concurrent/helper';

const List = mount(renew => {
  const query = deferred('initial', renew);
  return () => (
    <div>
      <button onClick={() => { query.value = 'updated'; }}>Update list</button>
      <p>{query.v}</p>
    </div>
  );
});`}
      />
      <h2>ldeferred(value)</h2>
      <p>
        {ko
          ? 'lmount에서 사용합니다. useRenew로 현재 컴포넌트를 찾아 같은 저우선순위 setter 계약을 제공합니다. 자동 JSX 런타임과 helper의 코어를 맞추려면 렌더링 가이드의 alias를 적용하세요.'
          : 'Use it in lmount. It captures the current component through useRenew and provides the same setter contract. Apply the core alias from the rendering guide so JSX and helpers use the same renderer.'}
      </p>
      <CodeBlock
        language="tsx"
        code={`import { lmount } from 'lithent-concurrent';
import { ldeferred } from 'lithent-concurrent/helper';

const List = lmount(() => {
  const query = ldeferred('initial');
  return () => (
    <div>
      <button onClick={() => { query.v = 'updated'; }}>Update list</button>
      <p>{query.value}</p>
    </div>
  );
});`}
      />
      <h2>hasPendingRender()</h2>
      <p>
        {ko
          ? 'mounter에서 호출하면 그 컴포넌트의 저우선순위 대기 여부를 value 또는 v로 조회합니다. 조회만으로 리렌더하지 않습니다. 표시가 필요하면 그 컴포넌트의 read 함수를 동기로 렌더되는 부모·형제에 전달하고, setter 뒤와 whenIdle 뒤에 표시를 명시적으로 갱신하세요.'
          : 'Call it in the mounter to bind value and v to that component’s low-priority queue. Reading it does not trigger a render. To display progress, expose that component’s read function to a synchronous parent or sibling and explicitly refresh it after scheduling and after whenIdle.'}
      </p>
      <CodeBlock
        language="typescript"
        code={`// Inside the deferred component's mounter:
const pending = hasPendingRender();
const readPending = () => pending.value;

// A separate synchronous component can read that function.
// Its own hasPendingRender() would query its own queue, not the list's.`}
      />
      <h2>{ko ? '상태와 렌더의 차이' : 'State versus rendering'}</h2>
      <p>
        {ko
          ? '새 값은 setter 직후부터 읽힙니다. 같은 컴포넌트에 동기 갱신이 들어오면 미룬 값도 바로 화면에 나타날 수 있습니다. pending은 레인에 대기 중인지를 뜻하며 데이터 요청 상태나 전체 앱의 로딩 상태가 아닙니다.'
          : 'The new value is readable immediately after a setter. A synchronous update to the same component can reveal it before the deferred render. Pending describes its queued rendering work, rather than a data request or application-wide loading state.'}
      </p>
      <p>
        <a
          href="#/guide/concurrent-rendering"
          onClick={(event: Event) => {
            event.preventDefault();
            navigateTo('/guide/concurrent-rendering');
          }}
        >
          {ko ? '설정과 실행 예제 →' : 'Setup and live example →'}
        </a>
      </p>
    </div>
  );
};

export const ConcurrentHelpers = () => <ConcurrentHelpersGuide language="en" />;
