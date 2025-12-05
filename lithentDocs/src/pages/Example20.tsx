import { mount } from 'lithent';
import { Example20 } from '@/components/examples/example20';
import { CodeBlock } from '@/components/CodeBlock';

export const Example20Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 20: 마법 포탈 메신저
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 Portal 기능을 사용하여 메시지를 서로 다른 DOM 위치로 전송하는
        마법 포탈 메신저를 구현합니다. Portal의 핵심 특성을 직관적이고 재미있게
        경험할 수 있습니다!
      </p>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          💡 학습 포인트
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          <strong>Portal의 마법:</strong> 중앙 제어판에서 메시지를 생성하면,
          선택한 포탈 영역(불의 차원/물의 차원)에 메시지가 나타납니다. 메시지는
          물리적으로 다른 DOM 위치에 렌더링되지만, 상태와 생명주기는 부모
          컴포넌트가 관리합니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Portal이란?
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        Portal은 컴포넌트를 부모 DOM 계층 외부로 렌더링하는 강력한 기능입니다.
        일반적으로 컴포넌트는 부모의 DOM 트리 안에 렌더링되지만, 모달이나
        툴팁처럼 화면 위에 떠 있어야 하는 UI는 부모의 overflow나 z-index 때문에
        가려질 수 있습니다.
      </p>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        마법 포탈 메신저의 구조
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>2개의 차원 포탈:</strong> 불의 차원(🔥), 물의 차원(💧)
        </li>
        <li>
          <strong>중앙 제어판:</strong> 메시지를 작성하고 전송할 포탈을 선택
        </li>
        <li>
          <strong>Portal 렌더링:</strong> 선택한 포탈 영역에 메시지가 나타남
        </li>
        <li>
          <strong>독립적인 상태:</strong> 각 포탈은 자신만의 메시지 히스토리
          유지
        </li>
        <li>
          <strong>실시간 업데이트:</strong> 메시지 추가/삭제 시 즉시 반영
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        사용된 기술
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            portal()
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            메시지를 다른 DOM 위치로 렌더링합니다. portal(content,
            targetElement)로 사용합니다.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ref
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            각 포탈 목적지의 DOM 엘리먼트를 참조합니다. Portal의 렌더링 대상으로
            사용됩니다.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            state (helper)
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            메시지 상태, 선택된 포탈, 메시지 히스토리를 관리합니다. .v로
            접근하고 자동으로 리렌더링됩니다.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            mountCallback
          </h3>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            첫 렌더링 후 ref가 설정되면 다시 렌더링하여 Portal을 활성화합니다.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        다음은 Portal을 사용하여 SSR로 미리 렌더링된 영역에 메시지를 전송하는
        예제입니다:
      </p>

      <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 SSR 시나리오
        </h3>
        <p class="text-xs text-gray-700 dark:text-gray-300">
          서버에서 HTML에 포탈 영역을 미리 렌더링하고, 클라이언트에서 Portal을
          사용해 해당 영역에 동적 콘텐츠를 렌더링합니다.
        </p>
      </div>

      <CodeBlock
        language="html"
        code={`<!-- index.html (서버에서 렌더링된 HTML) -->
<!DOCTYPE html>
<html>
<body>
  <!-- 앱이 마운트될 영역 -->
  <div id="app"></div>

  <!-- SSR로 미리 렌더링된 포탈 영역들 -->
  <div id="fire-portal" class="portal-zone">
    <h3>🔥 불의 차원</h3>
    <p>메시지가 이곳에 나타납니다...</p>
  </div>

  <div id="water-portal" class="portal-zone">
    <h3>💧 물의 차원</h3>
    <p>메시지가 이곳에 나타납니다...</p>
  </div>
</body>
</html>`}
      />

      <CodeBlock
        language="tsx"
        code={`// app.tsx (클라이언트 코드)
import { mount, mountCallback, portal } from 'lithent';
import { state } from 'lithent/helper';

export const PortalMessenger = mount(r => {
  const messageText = state('', r);
  const selectedPortal = state('fire', r);
  const messages = state<Record<string, string[]>>(
    { fire: [], water: [] },
    r
  );

  // 첫 렌더링 후 포탈 DOM이 준비되면 리렌더
  mountCallback(() => r());

  const sendMessage = () => {
    if (!messageText.v.trim()) return;
    const portalId = selectedPortal.v;
    messages.v = {
      ...messages.v,
      [portalId]: [...messages.v[portalId], messageText.v]
    };
    messageText.v = '';
  };

  // 불의 차원 포탈 렌더링
  const renderFirePortal = () => {
    const fireEl = document.getElementById('fire-portal');
    return fireEl && messages.v.fire.length > 0
      ? portal(FireMessages, fireEl)
      : null;
  };

  // 물의 차원 포탈 렌더링
  const renderWaterPortal = () => {
    const waterEl = document.getElementById('water-portal');
    return waterEl && messages.v.water.length > 0
      ? portal(WaterMessages, waterEl)
      : null;
  };

  return () => (
    <div>
      {/* 메시지 입력 UI */}
      <div class="control-panel">
        <select
          value={selectedPortal.v}
          onChange={(e) => selectedPortal.v = e.target.value}
        >
          <option value="fire">🔥 불의 차원</option>
          <option value="water">💧 물의 차원</option>
        </select>

        <textarea
          value={messageText.v}
          onInput={(e) => messageText.v = e.target.value}
          placeholder="메시지를 입력하세요..."
        />

        <button onClick={sendMessage}>전송</button>
      </div>

      {/* Portal 렌더링 */}
      {renderFirePortal()}
      {renderWaterPortal()}
    </div>
  );
});`}
      />

      <p class="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
        <strong>불의 차원에 렌더링될 HTML:</strong>
      </p>

      <CodeBlock
        language="html"
        code={`<!-- fire-portal 영역에 Portal로 렌더링되는 내용 -->
<div class="messages">
  <div class="message">첫 번째 메시지</div>
  <div class="message">두 번째 메시지</div>
  <div class="message">세 번째 메시지</div>
</div>`}
      />

      <p class="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
        <strong>물의 차원에 렌더링될 HTML:</strong>
      </p>

      <CodeBlock
        language="html"
        code={`<!-- water-portal 영역에 Portal로 렌더링되는 내용 -->
<div class="messages">
  <div class="message">안녕하세요</div>
  <div class="message">Portal 테스트</div>
  <div class="message">물의 차원 메시지</div>
</div>`}
      />

      <div class="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 핵심 포인트
        </h3>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>
            <strong>1. SSR 영역 활용:</strong> HTML에 미리 정의된 포탈 영역
            (fire-portal, water-portal)을 사용합니다.
          </li>
          <li>
            <strong>2. document.getElementById():</strong> SSR로 렌더링된 DOM
            요소를 직접 참조합니다.
          </li>
          <li>
            <strong>3. portal() 함수:</strong> portal(내용, 대상Element)로 SSR
            영역에 동적 콘텐츠를 렌더링합니다.
          </li>
          <li>
            <strong>4. 분리된 렌더링:</strong> 불의 차원과 물의 차원은 각각
            독립된 HTML로 렌더링되며, 서로 영향을 주지 않습니다.
          </li>
          <li>
            <strong>5. 상태 관리:</strong> 메시지 상태는 컴포넌트가 관리하지만,
            UI는 HTML의 포탈 영역에 나타납니다.
          </li>
          <li>
            <strong>6. 하이브리드 렌더링:</strong> SSR의 성능 + 클라이언트의
            인터랙티브 UI를 결합한 패턴입니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example20 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Portal의 핵심 특성
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🎯 Portal이 해결하는 문제
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ Overflow 문제 해결
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              부모 컨테이너에 overflow: hidden이 있어도 Portal로 렌더링된 요소는
              영향받지 않습니다. 모달이나 드롭다운이 잘리지 않게 만들 수
              있습니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ Z-index 관리 단순화
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Portal을 document.body나 전용 컨테이너에 렌더링하면 z-index 계층을
              쉽게 관리할 수 있습니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ 논리적 구조 유지
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              DOM 위치는 다르지만, 컴포넌트 트리에서는 부모-자식 관계가
              유지됩니다. 상태와 props를 자연스럽게 공유할 수 있습니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ 생명주기 자동 관리
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              부모 컴포넌트가 언마운트되면 Portal 내부도 자동으로 정리됩니다.
              메모리 누수 걱정이 없습니다.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 핵심 부분
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Portal 사용 패턴
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>1. Ref로 대상 DOM 참조:</strong>
            <pre class="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
              {`const portalRef = ref(null);

return () => (
  <div ref={portalRef}>
    {/* 포탈 목적지 */}
  </div>
);`}
            </pre>
          </div>

          <div>
            <strong>2. Portal로 렌더링:</strong>
            <pre class="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
              {`{portalRef.value && portal(
  <MessageComponent message={msg} />,
  portalRef.value as HTMLElement
)}`}
            </pre>
          </div>

          <div>
            <strong>3. mountCallback으로 리렌더:</strong>
            <pre class="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
              {`mountCallback(() => {
  // 첫 렌더링 후 ref가 설정되면 다시 렌더링
  renew();
});`}
            </pre>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실전 활용 예시
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h4 class="text-base font-semibold text-red-900 dark:text-red-100 mb-2">
            🎨 모달 & 다이얼로그
          </h4>
          <p class="text-sm text-red-800 dark:text-red-200">
            사용자 확인, 경고, 정보 표시 등을 위한 모달을 document.body에
            렌더링하여 항상 최상단에 표시할 수 있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💬 툴팁 & 팝오버
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            마우스 호버 시 나타나는 툴팁을 overflow 제약 없이 표시할 수
            있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            🔔 알림 시스템
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            화면 모서리에 고정된 알림을 표시하는 토스트 메시지 시스템을 구현할
            수 있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            📋 드롭다운 메뉴
          </h4>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            컨텍스트 메뉴나 드롭다운이 부모 컨테이너에 잘리지 않도록 할 수
            있습니다.
          </p>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong>이벤트 버블링:</strong> Portal로 렌더링된 요소의 이벤트는
            DOM 트리가 아닌 컴포넌트 트리를 따라 버블링됩니다.
          </li>
          <li>
            <strong>CSS 상속:</strong> Portal 요소는 대상 위치의 CSS를
            상속받습니다. 독립적인 스타일을 정의해야 합니다.
          </li>
          <li>
            <strong>Ref 타이밍:</strong> 첫 렌더링 시 ref.value는 null입니다.
            mountCallback으로 리렌더링이 필요할 수 있습니다.
          </li>
          <li>
            <strong>SSR 제한:</strong> Portal은 브라우저 환경에서만 작동합니다.
            SSR 시 조건부 렌더링이 필요할 수 있습니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        확장 아이디어
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📱 다중 모달 관리
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            여러 모달을 순서대로 쌓아 올릴 수 있는 모달 스택 매니저를
            만들어보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎬 애니메이션 추가
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Portal 등장/사라짐에 fade-in, slide-in 등의 애니메이션을
            추가해보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎯 위치 자동 계산
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            툴팁이 화면을 벗어나지 않도록 자동으로 위치를 조정하는 기능을
            추가해보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ⌨️ 키보드 네비게이션
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Esc 키로 모달 닫기, Tab으로 포커스 이동 등의 접근성 기능을
            추가해보세요.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 문서
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/portal"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/portal');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Portal 가이드
          </a>{' '}
          - Portal의 모든 기능과 API 문서
        </li>
        <li>
          <a
            href="/guide/mount-hooks"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/mount-hooks');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Mount Hooks 가이드
          </a>{' '}
          - mountCallback과 컴포넌트 생명주기
        </li>
        <li>
          <a
            href="/guide/state-ref"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state-ref');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State-Ref 가이드
          </a>{' '}
          - ref를 사용한 DOM 요소 참조
        </li>
      </ul>
    </div>
  );
});
