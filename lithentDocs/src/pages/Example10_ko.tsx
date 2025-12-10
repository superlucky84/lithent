import { CodeBlock } from '@/components/CodeBlock';
import { Example10Ko } from '@/components/examples/example10_ko';
import type { Introduction } from '@/pages/Introduction';

const example10Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

const PizzaBuilder = mount(r => {
  const selectedToppings = state<string[]>(['pepperoni', 'mozzarella'], r);
  const size = state<'small' | 'medium' | 'large'>('medium', r);
  const crust = state<'thin' | 'regular' | 'thick'>('regular', r);

  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.v.includes(toppingId)) {
      selectedToppings.v = selectedToppings.v.filter(id => id !== toppingId);
    } else {
      selectedToppings.v = [...selectedToppings.v, toppingId];
    }
  };

  return () => (
    <>
      {/* Radio Buttons - Single Selection */}
      <input
        type="radio"
        name="size"
        value="small"
        checked={size.v === 'small'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Small

      <input
        type="radio"
        name="size"
        value="medium"
        checked={size.v === 'medium'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Medium

      {/* Checkboxes - Multiple Selection */}
      <input
        type="checkbox"
        value="pepperoni"
        checked={selectedToppings.v.includes('pepperoni')}
        onChange={() => toggleTopping('pepperoni')}
      /> Pepperoni

      <input
        type="checkbox"
        value="mushroom"
        checked={selectedToppings.v.includes('mushroom')}
        onChange={() => toggleTopping('mushroom')}
      /> Mushroom
    </>
  );
});
`;

export const Example10PageKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Checkbox & Radio Controls (Pizza Builder)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input type="checkbox"&gt;
      </code>{' '}
      와{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input type="radio"&gt;
      </code>{' '}
      요소가 올바르게 동작하는지 보여주는 인터랙티브 피자 빌더 예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent가 체크박스의 다중 선택과 라디오 버튼의 단일 선택을 정확하게
        처리하고, checked 속성을 올바르게 동기화하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      토핑 체크박스를 선택하면 여러 개를 동시에 선택할 수 있고, 피자 크기나
      크러스트는 라디오 버튼으로 하나만 선택할 수 있습니다. 실시간으로 가격이
      계산되고 피자 프리뷰가 업데이트됩니다!
    </p>

    <CodeBlock language="typescript" code={example10Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example10Ko />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Checkbox의 핵심 동작
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>다중 선택</strong>: 여러 체크박스를 동시에 선택할 수 있습니다
        </li>
        <li>
          <strong>onChange 이벤트</strong>: 체크박스를 클릭할 때마다 이벤트
          핸들러가 실행됩니다
        </li>
        <li>
          <strong>checked 속성</strong>: 배열에 값이 포함되어 있는지 확인하여
          checked 상태를 결정
        </li>
        <li>
          <strong>배열 상태 관리</strong>: 선택된 값들을 배열로 관리하며,
          추가/제거 시 불변성을 유지
        </li>
        <li>
          <strong>value 속성</strong>: 각 체크박스의 고유한 값을 식별하는데
          사용됩니다
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Radio Button의 핵심 동작
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>단일 선택</strong>: 같은 name 속성을 가진 라디오 버튼 중
          하나만 선택 가능
        </li>
        <li>
          <strong>name 그룹화</strong>: name 속성으로 라디오 버튼을 그룹화하여
          상호 배타적 선택 구현
        </li>
        <li>
          <strong>onChange 이벤트</strong>: 라디오 버튼을 선택하면 이벤트
          핸들러가 실행됩니다
        </li>
        <li>
          <strong>checked 속성</strong>: 현재 상태값과 라디오 버튼의 value를
          비교하여 checked 상태 결정
        </li>
        <li>
          <strong>자동 해제</strong>: 같은 그룹의 다른 라디오 버튼을 선택하면
          이전 선택이 자동으로 해제됨
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        주요 기능
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>17가지 토핑</strong>: 고기, 야채, 치즈, 엑스트라로 분류된
          다양한 토핑
        </li>
        <li>
          <strong>5가지 프리셋</strong>: Pepperoni, Veggie, Meat Lovers,
          Hawaiian, Supreme
        </li>
        <li>
          <strong>3가지 크기</strong>: Small, Medium, Large (라디오 버튼)
        </li>
        <li>
          <strong>3가지 크러스트</strong>: Thin, Regular, Thick (라디오 버튼)
        </li>
        <li>
          <strong>실시간 가격 계산</strong>: 기본 가격 + 토핑 가격 자동 합산
        </li>
        <li>
          <strong>영양 정보</strong>: 선택한 토핑의 칼로리 총합 표시
        </li>
        <li>
          <strong>비주얼 프리뷰</strong>: 선택한 토핑의 이모지가 피자 위에
          표시됨
        </li>
        <li>
          <strong>Clear All 기능</strong>: 모든 토핑 선택 해제
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>여러 토핑 체크박스를 동시에 선택하여 다중 선택이 잘 되는지 확인</li>
        <li>체크박스를 다시 클릭하여 선택 해제가 올바르게 동작하는지 확인</li>
        <li>
          라디오 버튼으로 크기를 변경하면 이전 선택이 자동으로 해제되는지 확인
        </li>
        <li>Preset 버튼으로 여러 체크박스가 한 번에 선택/해제되는지 확인</li>
        <li>Clear All로 모든 체크박스가 해제되는지 확인 (라디오는 유지)</li>
        <li>가격과 칼로리가 선택에 따라 실시간으로 업데이트되는지 확인</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        🍕 왜 피자 빌더인가?
      </h3>
      <p class="text-sm text-orange-700 dark:text-orange-300 mb-2">
        체크박스와 라디오 버튼의 차이를 가장 직관적으로 이해할 수 있는
        예제입니다. 토핑은 여러 개를 선택할 수 있지만(체크박스), 크기와
        크러스트는 하나만 선택할 수 있다는(라디오) 실생활의 경험과 일치합니다.
      </p>
      <p class="text-xs text-orange-600 dark:text-orange-400 italic">
        💡 참고: 실제 피자 주문 앱도 비슷한 패턴을 사용합니다. 이 예제는 단순히
        폼 컨트롤을 테스트하는 것을 넘어, 실용적인 UI 패턴을 배울 수 있는 교육
        자료이기도 합니다!
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Checkbox vs Radio Button
      </h3>
      <div class="text-sm text-purple-700 dark:text-purple-300 space-y-2">
        <div>
          <strong>Checkbox</strong>: 독립적인 선택 항목. 각 체크박스는 다른
          체크박스와 무관하게 선택/해제 가능. 배열로 상태 관리.
        </div>
        <div>
          <strong>Radio Button</strong>: 상호 배타적 선택. 같은 name을 가진
          라디오 중 하나만 선택 가능. 단일 값으로 상태 관리.
        </div>
        <div class="text-xs text-purple-600 dark:text-purple-400 italic mt-2">
          💡 팁: name 속성을 사용하지 않으면 라디오 버튼이 제대로 그룹화되지
          않아 여러 개를 동시에 선택할 수 있게 됩니다. 이 예제에서 name="size"와
          name="crust"로 두 그룹을 분리했습니다.
        </div>
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State 가이드
          </a>{' '}
          - 체크박스/라디오 선택을 배열·단일 값 상태로 관리하는 패턴을
          설명합니다.
        </li>
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/props');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Props 가이드
          </a>{' '}
          - checked/value/name 같은 폼 관련 props를 어떻게 다루는지 정리한
          문서입니다.
        </li>
      </ul>
    </div>
  </div>
);
