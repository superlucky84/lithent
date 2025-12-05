import { CodeBlock } from '@/components/CodeBlock';
import { Example8 } from '@/components/examples/example8';
import type { Introduction } from '@/pages/Introduction';

const example8Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Character {
  face: string;
  hair: string;
  eyes: string;
  outfit: string;
}

const CharacterCreator = mount(r => {
  const character = state<Character>({
    face: '😊',
    hair: '🦰',
    eyes: '👀',
    outfit: '👔',
  }, r);

  const updateCharacter = (key: keyof Character, value: string) => {
    character.v = { ...character.v, [key]: value };
  };

  return () => (
    <>
      {/* Character Preview */}
      <div class="preview">
        <div>{character.v.face}</div>
        <div>{character.v.hair} {character.v.eyes}</div>
        <div>{character.v.outfit}</div>
      </div>

      {/* Select Controls */}
      <select
        value={character.v.face}
        onChange={(e) => updateCharacter('face', e.target.value)}
      >
        <option value="😊" selected={character.v.face === '😊'}>Happy</option>
        <option value="😎" selected={character.v.face === '😎'}>Cool</option>
        <option value="🤓" selected={character.v.face === '🤓'}>Nerdy</option>
      </select>

      <select
        value={character.v.hair}
        onChange={(e) => updateCharacter('hair', e.target.value)}
      >
        <option value="🦰" selected={character.v.hair === '🦰'}>Red Hair</option>
        <option value="🦱" selected={character.v.hair === '🦱'}>Curly</option>
        <option value="🦲" selected={character.v.hair === '🦲'}>Bald</option>
      </select>
    </>
  );
});
`;

export const Example8Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Select Controls (Character Creator)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;select&gt;
      </code>{' '}
      요소와{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        selected
      </code>{' '}
      속성이 올바르게 동작하는지 보여주는 이모지 기반 캐릭터 크리에이터
      예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent가 select 요소의 onChange 이벤트를 처리하고, selected 속성을 통해
        현재 선택된 옵션을 정확하게 동기화하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      각 드롭다운에서 옵션을 선택하면 캐릭터가 실시간으로 변경됩니다. Preset
      버튼이나 Randomize 기능으로 다양한 조합을 시도해보세요!
    </p>

    <CodeBlock language="typescript" code={example8Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example8 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Select 요소의 핵심 동작
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>onChange 이벤트</strong>: 사용자가 옵션을 선택하면 이벤트
          핸들러가 즉시 실행됩니다
        </li>
        <li>
          <strong>selected 속성</strong>: 현재 상태값과 옵션의 value를 비교하여
          selected 속성을 동적으로 설정
        </li>
        <li>
          <strong>양방향 바인딩</strong>: value prop으로 현재 선택값을 설정하고,
          onChange로 변경사항을 감지
        </li>
        <li>
          <strong>상태 동기화</strong>: Preset이나 Randomize처럼 프로그래밍
          방식으로 상태를 변경해도 select가 올바르게 업데이트됨
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        주요 기능
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>다양한 커스터마이징 옵션</strong>: 얼굴, 헤어, 눈, 옷,
          악세사리, 배경을 각각 선택
        </li>
        <li>
          <strong>Preset 시스템</strong>: Developer, Pirate, Royalty, Athlete
          프리셋 제공
        </li>
        <li>
          <strong>Randomize 기능</strong>: 랜덤하게 캐릭터 생성
        </li>
        <li>
          <strong>Export 기능</strong>: 캐릭터 데이터를 JSON으로 클립보드에 복사
        </li>
        <li>
          <strong>실시간 프리뷰</strong>: Select 변경 시 즉시 캐릭터 모습이
          업데이트
        </li>
        <li>
          <strong>그라디언트 배경</strong>: Tailwind CSS 그라디언트로 다양한
          분위기 연출
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          각 드롭다운에서 다양한 옵션을 선택하여 캐릭터가 즉시 변경되는지 확인
        </li>
        <li>
          Preset 버튼을 클릭하여 모든 select가 한 번에 업데이트되는지 확인
        </li>
        <li>
          Randomize로 무작위 조합 생성 후 각 select의 선택값이 올바른지 확인
        </li>
        <li>
          같은 드롭다운을 여러 번 변경하여 selected 속성이 정확히 동기화되는지
          확인
        </li>
        <li>Export 버튼으로 현재 상태를 JSON으로 내보낼 수 있는지 테스트</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎨 왜 이모지 캐릭터인가?
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300 mb-2">
        단순한 숫자나 텍스트 select 예제는 지루할 수 있습니다. 이모지를 사용하면
        select의 동작을 테스트하면서도 시각적으로 즐거운 경험을 제공할 수
        있습니다.
      </p>
      <p class="text-xs text-purple-600 dark:text-purple-400 italic">
        💡 참고: 실제 게임이나 앱의 아바타 시스템도 비슷한 방식으로 동작합니다.
        Select 대신 버튼이나 이미지 선택기를 사용할 수도 있지만, 핵심 로직은
        동일합니다!
      </p>
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
          - select 변경에 따라 Character 상태를 갱신하는 기본 패턴을 자세히
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
          - value/selected 같은 DOM 속성을 props로 제어할 때의 규칙을 함께
          참고하면 좋습니다.
        </li>
      </ul>
    </div>
  </div>
);
