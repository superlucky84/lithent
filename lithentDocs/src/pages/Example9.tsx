import { CodeBlock } from '@/components/CodeBlock';
import { Example9 } from '@/components/examples/example9';
import type { Introduction } from '@/pages/Introduction';

const example9Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
}

const CardGenerator = mount(r => {
  const card = state<BusinessCard>({
    name: 'Your Name',
    title: 'Your Title',
    company: 'Your Company',
    email: 'email@example.com',
  }, r);

  const updateField = (field: keyof BusinessCard, value: string) => {
    card.v = { ...card.v, [field]: value };
  };

  return () => (
    <>
      {/* Card Preview */}
      <div class="card-preview">
        <h2>{card.v.name}</h2>
        <p>{card.v.title}</p>
        <p>{card.v.company}</p>
        <p>{card.v.email}</p>
      </div>

      {/* Input Fields */}
      <input
        type="text"
        value={card.v.name}
        onInput={(e) => updateField('name', e.target.value)}
        placeholder="Enter your name"
      />

      <input
        type="email"
        value={card.v.email}
        onInput={(e) => updateField('email', e.target.value)}
        placeholder="your@email.com"
      />
    </>
  );
});
`;

export const Example9Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Input Controls (Business Card Generator)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;input&gt;
      </code>{' '}
      요소와{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;textarea&gt;
      </code>{' '}
      요소가 올바르게 동작하는지 보여주는 실시간 명함 생성기 예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent가 input/textarea 요소의 onInput 이벤트를 처리하고, value 속성을
        통해 양방향 바인딩을 정확하게 구현하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      각 input 필드에 텍스트를 입력하면 명함 프리뷰가 실시간으로 업데이트됩니다.
      Template 버튼으로 샘플 데이터를 불러오거나 직접 입력해보세요!
    </p>

    <CodeBlock language="typescript" code={example9Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example9 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Input 요소의 핵심 동작
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>onInput 이벤트</strong>: 사용자가 타이핑할 때마다 이벤트
          핸들러가 즉시 실행됩니다
        </li>
        <li>
          <strong>value 바인딩</strong>: value prop으로 현재 입력값을 설정하여
          양방향 바인딩 구현
        </li>
        <li>
          <strong>다양한 input 타입</strong>: text, email, tel, url 등 다양한
          타입의 input 지원
        </li>
        <li>
          <strong>textarea 지원</strong>: 여러 줄 텍스트 입력도 동일한 방식으로
          동작
        </li>
        <li>
          <strong>실시간 동기화</strong>: Template 로드 시 모든 input 필드가
          즉시 업데이트됨
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        주요 기능
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>7가지 입력 필드</strong>: Name, Title, Company, Email, Phone,
          Website, Bio
        </li>
        <li>
          <strong>Template 시스템</strong>: Developer, Designer, Entrepreneur
          프리셋
        </li>
        <li>
          <strong>4가지 테마</strong>: Modern, Classic, Minimal, Vibrant 스타일
        </li>
        <li>
          <strong>실시간 프리뷰</strong>: 명함 카드가 입력과 동시에 업데이트
        </li>
        <li>
          <strong>Reset 기능</strong>: 모든 필드를 한 번에 초기화
        </li>
        <li>
          <strong>Export 기능</strong>: 명함 데이터를 JSON으로 내보내기
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>각 input 필드에 텍스트를 입력하여 실시간 업데이트 확인</li>
        <li>Template 버튼으로 모든 필드가 한 번에 채워지는지 확인</li>
        <li>Email이나 Phone 같은 특수 input type이 올바르게 동작하는지 확인</li>
        <li>Textarea에 여러 줄 텍스트를 입력하여 line-clamp 동작 확인</li>
        <li>Theme 버튼으로 명함 스타일이 즉시 변경되는지 확인</li>
        <li>Reset 후 모든 input 필드가 초기화되는지 확인</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        💼 실용적인 예제
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        이 명함 생성기는 단순한 데모를 넘어 실제로 사용 가능한 도구입니다.
        네트워킹 이벤트에서 디지털 명함으로 사용하거나, 이메일 서명에 넣을
        프로필 카드로 활용할 수 있습니다.
      </p>
      <p class="text-xs text-green-600 dark:text-green-400 italic">
        💡 참고: 실제 서비스에서는 입력값 검증(이메일 형식, 전화번호 형식 등)과
        sanitization을 추가하는 것이 좋습니다. 또한 명함 디자인을 이미지나 PDF로
        내보내는 기능도 구현할 수 있습니다!
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Input vs onChange vs onInput
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300">
        Lithent는{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onInput
        </code>
        이벤트를 권장합니다.{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onChange
        </code>
        는 포커스를 잃었을 때만 발생하지만,{' '}
        <code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs">
          onInput
        </code>
        은 타이핑할 때마다 즉시 발생하여 더 반응적인 UI를 만들 수 있습니다.
      </p>
    </div>
  </div>
);
