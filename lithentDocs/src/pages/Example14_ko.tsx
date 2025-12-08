import { mount } from 'lithent';
import { Example14Ko } from '@/components/examples/example14_ko';
import { CodeBlock } from '@/components/CodeBlock';

export const Example14PageKo = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Nested Component Unmount Callbacks
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 중첩된 컴포넌트 계층에서 <code>mountCallback</code>의 cleanup
        함수가 어떤 순서로 실행되는지 테스트합니다. 컴포넌트 트리가 언마운트될
        때, 부모에서 자식으로 cleanup이 전파되는지 확인할 수 있습니다.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 테스트 요점
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nested Unmount Callbacks</strong>: 부모 컴포넌트가 언마운트될
          때, 자식 컴포넌트들의 cleanup 함수도 올바른 순서로 실행되는지
          확인합니다. 이는 메모리 누수 방지와 리소스 정리에 중요합니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        컴포넌트 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 3단계 중첩 구조를 가진 게임 인벤토리 시스템입니다:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Depth 1 (Inventory)</strong>: 전체 인벤토리 시스템 - "🎒
          Inventory system initialized/shutdown" 로그
        </li>
        <li>
          <strong>Depth 2 (InventoryCategory)</strong>: 무기/방어구/포션
          카테고리 - "📂 Category opened/closed" 로그
        </li>
        <li>
          <strong>Depth 3 (ItemSlot)</strong>: 개별 아이템 (총 8개) - "📦 Item
          equipped/unequipped" 로그
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <CodeBlock
        code={`// Depth 3: 개별 아이템 컴포넌트
const ItemSlot = mount<{
  item: Item;
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📦 \${props.item.name} equipped</span><br>\`;
    }

    // cleanup 함수: 언마운트 시 실행
    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>❌ \${props.item.name} unequipped</span><br>\`;
      }
    };
  });

  return () => (
    <div class="flex items-center gap-2 p-2 rounded border">
      <span class="text-2xl">{props.item.icon}</span>
      <span class="text-xs">{props.item.name}</span>
    </div>
  );
});

// Depth 2: 카테고리 컴포넌트
const InventoryCategory = mount<{
  title: string;
  items: Item[];
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📂 \${props.title} category opened</span><br>\`;
    }

    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🗂️ \${props.title} category closed</span><br>\`;
      }
    };
  });

  return () => (
    <div>
      <h4>{props.title}</h4>
      {props.items.map(item => (
        <ItemSlot key={item.id} item={item} logEl={props.logEl} />
      ))}
    </div>
  );
});

// Depth 1: 인벤토리 컴포넌트
const Inventory = mount<{ logEl: { value: HTMLElement | null } }>(
  (_r, props) => {
    mountCallback(() => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🎒 Inventory system initialized</span><br>\`;
      }

      return () => {
        const ele = props.logEl.value as HTMLElement;
        if (ele) {
          ele.innerHTML += \`<span>🎒 Inventory system shutdown</span><br>\`;
        }
      };
    });

    return () => (
      <div>
        <InventoryCategory title="Weapons" items={weaponItems} logEl={props.logEl} />
        <InventoryCategory title="Armor" items={armorItems} logEl={props.logEl} />
        <InventoryCategory title="Potions" items={potionItems} logEl={props.logEl} />
      </div>
    );
  }
);`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Unmount 순서
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        "Close Inventory" 버튼을 클릭하면 다음 순서로 cleanup이 실행됩니다:
      </p>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong>🎒 Inventory system shutdown</strong> (Depth 1 - 부모
            컴포넌트)
          </li>
          <li>
            <strong>🗂️ Weapons category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Iron Sword unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Magic Staff unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Dragon Blade unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>🗂️ Armor category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Leather Armor unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Steel Helmet unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>🗂️ Potions category closed</strong> (Depth 2)
          </li>
          <li>
            <strong>❌ Health Potion unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Mana Potion unequipped</strong> (Depth 3)
          </li>
          <li>
            <strong>❌ Elixir of Life unequipped</strong> (Depth 3)
          </li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 핵심 개념
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>부모 우선 정리:</strong> 부모 컴포넌트의 cleanup이 먼저
            실행되고, 그 다음 자식들의 cleanup이 실행됩니다.
          </li>
          <li>
            <strong>깊이 우선 탐색(DFS):</strong> 각 자식 컴포넌트의 cleanup이
            실행된 후, 그 자식의 모든 하위 컴포넌트들이 cleanup됩니다. 예를
            들어, Weapons 카테고리가 닫히면 그 카테고리의 모든 아이템이
            언마운트된 후 다음 카테고리로 진행됩니다.
          </li>
          <li>
            <strong>리소스 정리:</strong> 이벤트 리스너, 타이머, 구독 등을
            정리하는 데 활용할 수 있습니다.
          </li>
          <li>
            <strong>메모리 누수 방지:</strong> 올바른 cleanup 순서는 메모리
            누수를 방지하는 데 중요합니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example14Ko />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        테스트 시나리오
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ 기본 언마운트 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>"Open Inventory" 버튼을 클릭하여 인벤토리를 엽니다</li>
          <li>
            Lifecycle Log에서 초기화 메시지들을 확인합니다 (Inventory system
            initialized → Categories opened → Items equipped)
          </li>
          <li>"Close Inventory" 버튼을 클릭합니다</li>
          <li>
            Lifecycle Log에서 cleanup 순서를 확인합니다 (Inventory shutdown →
            Categories closed → Items unequipped)
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ 반복 마운트/언마운트 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Open/Close 버튼을 여러 번 반복해서 클릭합니다</li>
          <li>
            매번 동일한 순서로 mount/unmount가 실행되는지 로그를 확인합니다
          </li>
          <li>메모리 누수 없이 깔끔하게 정리되는지 확인합니다</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ 계층 구조 시각화
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>하단의 "컴포넌트 계층 구조" 섹션을 참고합니다</li>
          <li>
            3단계 중첩 구조를 이해합니다 (Inventory → Category → ItemSlot)
          </li>
          <li>총 12개의 cleanup 함수가 실행됨을 확인합니다 (1 + 3 + 8)</li>
        </ol>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실전 활용 사례
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>이벤트 리스너 정리:</strong> 컴포넌트가 언마운트될 때 등록한
          이벤트 리스너를 제거
        </li>
        <li>
          <strong>타이머 정리:</strong> setInterval, setTimeout 등의 타이머 정리
        </li>
        <li>
          <strong>WebSocket 연결 종료:</strong> 실시간 통신 연결을 안전하게 종료
        </li>
        <li>
          <strong>애니메이션 취소:</strong> requestAnimationFrame 등의
          애니메이션 정리
        </li>
        <li>
          <strong>구독 해제:</strong> 옵저버 패턴에서 구독을 해제하여 메모리
          누수 방지
        </li>
      </ul>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>cleanup 함수는 컴포넌트가 DOM에서 제거되기 전에 실행됩니다.</li>
          <li>
            cleanup 함수 내에서 state를 변경하면 예상치 못한 동작이 발생할 수
            있으니 주의하세요.
          </li>
          <li>
            cleanup 함수는 순수 정리 로직만 포함해야 하며, 새로운 부작용을
            일으키지 않아야 합니다.
          </li>
          <li>
            비동기 작업이 있다면, cleanup 함수에서 취소하거나 완료를 기다리지
            않도록 처리해야 합니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 예제
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/examples/4"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/examples/4');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Example 4: Effect Lifecycle
          </a>{' '}
          - effect cleanup과 비교
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
          - mountCallback 기본 사용법
        </li>
      </ul>
    </div>
  );
});
