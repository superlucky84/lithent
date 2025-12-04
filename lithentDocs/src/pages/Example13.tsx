import { CodeBlock } from '@/components/CodeBlock';
import { Example13 } from '@/components/examples/example13';
import type { Introduction } from '@/pages/Introduction';

const example13Code = `import { mount, Fragment, render, ref, mountCallback } from 'lithent';
import { state } from 'lithent/helper';

interface Guest {
  id: number;
  name: string;
  partySize: number;
  waitTime: number;
  vip: boolean;
}

// 동적 대기 목록 컴포넌트 (가상 DOM)
const WaitlistManager = mount(r => {
  const guests = state<Guest[]>([...initialGuests], r);

  const sortByWaitTime = () => {
    guests.v = [...guests.v].sort((a, b) => a.waitTime - b.waitTime);
  };

  const reverseOrder = () => {
    guests.v = [...guests.v].reverse();
  };

  const callGuest = (id: number) => {
    guests.v = guests.v.filter(g => g.id !== id);
  };

  return () => (
    <Fragment>
      {/* 컨트롤 패널 */}
      <div>
        <button onClick={sortByWaitTime}>By Wait Time</button>
        <button onClick={reverseOrder}>Reverse</button>
      </div>

      {/* key 기반 리스트 */}
      {guests.v.map((guest, index) => (
        <div key={guest.id}>
          #{index + 1} {guest.name}
          <button onClick={() => callGuest(guest.id)}>Call</button>
        </div>
      ))}
    </Fragment>
  );
});

// 메인 컴포넌트
const RestaurantApp = mount(() => {
  const containerRef = ref<null | HTMLElement>(null);
  const insertionPointRef = ref<null | HTMLElement>(null);

  mountCallback(() => {
    // 가상 DOM을 실제 DOM 사이에 삽입
    render(<WaitlistManager />, containerRef.value, insertionPointRef.value);
  });

  return () => (
    <div ref={containerRef}>
      {/* 상단: 실제 DOM */}
      <div>Welcome Message (실제 DOM)</div>

      {/* 중간: 가상 DOM 리스트가 여기 삽입됨 */}

      {/* 하단: 실제 DOM */}
      <div ref={insertionPointRef}>Special Offer (실제 DOM)</div>
      <div>Footer (실제 DOM)</div>
    </div>
  );
});
`;

export const Example13Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mixed DOM with Loop (Restaurant Waitlist)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      실제 DOM과 가상 DOM이 혼합된 상태에서 <strong>루프(리스트) 요소</strong>를
      올바르게 처리할 수 있는지 테스트하는 예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는 Example 12의 확장판으로,{' '}
      <strong>
        key 기반 리스트가 실제 DOM 사이에서 동적으로 정렬, 추가, 제거될 때
        Lithent의 diff 알고리즘이 올바르게 동작하는지 검증
      </strong>
      합니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      레스토랑 대기 목록에서 손님을 대기 시간순, 파티 크기순, VIP 우선순으로
      정렬하거나 역순으로 바꿔보세요. Lithent가 key를 기반으로 DOM 요소를
      효율적으로 재정렬하고, 주변의 실제 DOM은 영향받지 않는지 확인할 수
      있습니다!
    </p>

    <CodeBlock language="typescript" code={example13Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example13 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        핵심 테스트 포인트
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>key 기반 diff</strong>: 리스트가 정렬될 때 key를 기반으로 기존
          DOM 요소를 재사용
        </li>
        <li>
          <strong>효율적인 재정렬</strong>: 전체를 다시 렌더링하지 않고 위치만
          변경
        </li>
        <li>
          <strong>혼합 DOM 보존</strong>: 리스트 업데이트 시 주변 실제
          DOM(Welcome, Special Offer, Footer)은 그대로 유지
        </li>
        <li>
          <strong>동적 추가/제거</strong>: 새 손님 추가, Call 버튼으로 제거 시
          올바른 위치에 삽입/제거
        </li>
        <li>
          <strong>Fragment 활용</strong>: 컨트롤 패널 + 리스트를 Fragment로
          그룹화하여 단일 삽입 지점 사용
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        리스트 조작 기능
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
            ⏱️ By Wait Time
          </h4>
          <p class="text-xs text-blue-700 dark:text-blue-300">
            대기 시간이 짧은 순서로 정렬 (5분 → 25분)
          </p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <h4 class="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
            👥 By Party Size
          </h4>
          <p class="text-xs text-purple-700 dark:text-purple-300">
            파티 크기가 큰 순서로 정렬 (6명 → 1명)
          </p>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <h4 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            ⭐ VIP First
          </h4>
          <p class="text-xs text-yellow-700 dark:text-yellow-300">
            VIP 손님을 맨 앞으로 우선 배치
          </p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            🔄 Reverse
          </h4>
          <p class="text-xs text-gray-700 dark:text-gray-300">
            현재 순서를 역순으로 뒤집기
          </p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <h4 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
            ➕ Add Guest
          </h4>
          <p class="text-xs text-green-700 dark:text-green-300">
            랜덤한 새 손님을 대기 목록에 추가
          </p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
          <h4 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            📢 Call
          </h4>
          <p class="text-xs text-red-700 dark:text-red-300">
            개별 손님을 호출하여 목록에서 제거
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        DOM 구조
      </h2>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <pre class="text-gray-800 dark:text-gray-200">
          {`<div> (containerRef)
  <!-- 실제 DOM: 상단 안내 -->
  <div>ℹ️ Welcome to Lithent Restaurant (실제 DOM)</div>

  <!-- 가상 DOM: Fragment로 그룹화된 리스트 -->
  <div>🎛️ Waitlist Controls (가상 DOM)</div>
  <div key={1}>#1 Kim Family (가상 DOM)</div>      <!-- 정렬 가능 -->
  <div key={2}>#2 Sarah & Alex (가상 DOM)</div>    <!-- 정렬 가능 -->
  <div key={3}>#3 Chen Party (가상 DOM)</div>      <!-- 정렬 가능 -->
  <div key={4}>#4 Jordan (가상 DOM)</div>          <!-- 정렬 가능 -->

  <!-- 실제 DOM: 하단 광고 & 푸터 (insertionPointRef) -->
  <div>🎁 Special Offer! (실제 DOM)</div>
  <div>📞 Contact Info (실제 DOM)</div>
</div>`}
        </pre>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          "By Wait Time" 버튼을 눌러 대기 시간순으로 정렬 → 순서가 바뀌는지 확인
        </li>
        <li>"Reverse" 버튼을 여러 번 눌러 리스트가 역순으로 뒤집히는지 확인</li>
        <li>"VIP First" 버튼으로 VIP(Sarah & Alex)가 맨 앞으로 가는지 확인</li>
        <li>
          정렬 중에도 상단 Welcome과 하단 Special Offer/Contact가 그대로인지
          확인
        </li>
        <li>
          "Call" 버튼으로 손님을 제거 → 나머지 손님의 번호(#1, #2...)가 자동으로
          업데이트되는지 확인
        </li>
        <li>"Add Guest"로 새 손님 추가 → 목록 맨 뒤에 추가되는지 확인</li>
        <li>
          모든 손님을 Call하면 "No guests waiting!" 메시지가 나타나는지 확인
        </li>
        <li>ID 배지를 보면서 정렬 시 같은 손님(같은 ID)이 이동하는지 확인</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        🍽️ 왜 레스토랑 대기 목록인가?
      </h3>
      <p class="text-sm text-orange-700 dark:text-orange-300 mb-2">
        실제 레스토랑 대기 목록 시스템은 다음과 같은 요구사항이 있습니다:
      </p>
      <ul class="text-sm text-orange-700 dark:text-orange-300 space-y-1 ml-4">
        <li>• 대기 시간, 파티 크기, VIP 여부에 따른 우선순위 정렬</li>
        <li>• 손님 호출 시 목록에서 실시간 제거</li>
        <li>• 새로운 손님 등록 시 즉시 목록에 추가</li>
        <li>• 정렬이 바뀌어도 각 손님의 정보(ID, 이름 등)는 유지</li>
      </ul>
      <p class="text-xs text-orange-600 dark:text-orange-400 italic mt-2">
        💡 이런 복잡한 리스트 조작은 key 기반 diff가 없으면 매번 전체를 다시
        렌더링해야 합니다. Lithent는 key를 통해 "같은 손님"을 추적하고 위치만
        변경하여 성능을 최적화합니다!
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Example 12 vs Example 13
      </h3>
      <div class="text-sm text-purple-700 dark:text-purple-300 space-y-2">
        <div>
          <strong>Example 12 (Mixed DOM)</strong>: 실제 DOM과 가상 DOM의
          기본적인 혼합. 고정된 개수의 포스트를 토글(추가/제거)
        </div>
        <div>
          <strong>Example 13 (Mixed DOM + Loop)</strong>: 혼합 DOM에 더해
          <strong className="text-purple-900 dark:text-purple-100">
            {' '}
            key 기반 리스트의 정렬, 재정렬, 동적 추가/제거
          </strong>
          를 테스트
        </div>
        <div class="text-xs text-purple-600 dark:text-purple-400 italic">
          💡 Example 12가 "정적 혼합"이라면, Example 13은 "동적 리스트
          혼합"입니다. 실제 앱에서는 두 패턴을 모두 사용합니다!
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        🌟 실전 활용 사례
      </h3>
      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
        <li>
          • <strong>TODO 리스트</strong>: 완료/미완료, 우선순위별 정렬
        </li>
        <li>
          • <strong>대시보드 테이블</strong>: 데이터 정렬, 필터링, 페이지네이션
        </li>
        <li>
          • <strong>채팅 메시지</strong>: 새 메시지 추가, 오래된 메시지는 서버
          렌더링
        </li>
        <li>
          • <strong>쇼핑 카트</strong>: 상품 추가/제거, 수량 변경, 가격순 정렬
        </li>
        <li>
          • <strong>티켓팅 시스템</strong>: 우선순위별 정렬, 상태 변경
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <h3 class="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
        ⚡ 성능 최적화 포인트
      </h3>
      <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <li>
          • <strong>key 사용</strong>: 각 손님에게 고유한 ID를 key로 설정하여
          DOM 재사용
        </li>
        <li>
          • <strong>불변성 유지</strong>:{' '}
          <code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
            [...guests.v].sort()
          </code>{' '}
          로 새 배열 생성
        </li>
        <li>
          • <strong>선택적 업데이트</strong>: 정렬 시 DOM 요소의 위치만 변경,
          내용은 재렌더링하지 않음
        </li>
        <li>
          • <strong>Fragment 활용</strong>: 여러 요소를 그룹화하여 단일 삽입
          지점 사용
        </li>
      </ul>
    </div>
  </div>
);
