import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Introduction = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      소개
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 작고 예측 가능한 UI를 만들기 위한 경량 JavaScript
      라이브러리입니다.
      <br />
      불필요한 마법이나 복잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로
      동작하는 것을 목표로 합니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      왜 Lithent를 만들었나요?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        가벼운 DOM 조작이 필요한, 용량에 민감한 환경
      </strong>
      에서도 부담 없이 사용할 수 있는 라이브러리가 필요했습니다. 기존의 많은
      프레임워크들은 강력하지만, 작은 프로젝트나 라이브러리에 포함시키기엔
      무겁습니다.
      <br />
      <br />
      Lithent는 이런 배경에서 탄생했습니다.{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Core만으로도 완전히 동작하는 UI를 만들 수 있습니다
      </strong>
      . 상태 관리, 반응성 시스템 같은 추가 기능이 필요하다면, 언제든지{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Helper를 확장팩처럼 선택적으로 추가
      </strong>
      할 수 있습니다.
      <br />
      <br />
      필요한 것만 가져다 쓰는 방식으로, 프로젝트 규모와 요구사항에 맞춰 유연하게
      확장할 수 있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      어떻게 사용하나요?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 크게 두 가지 방식을 제공합니다:{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        수동 제어 기반 (Manual Mode)
      </strong>
      과{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        선언형 기반 (Light API Mode)
      </strong>
      입니다. 이 두 방식은 한 프로젝트 내에서 자유롭게 혼용할 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      수동 제어 기반 (Manual Mode)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      상태는 JavaScript 개발자에게 가장 익숙한 패턴인
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        클로저
      </strong>
      에 담깁니다. 복잡한 반응성 시스템이나 특별한 문법 없이, 그저 변수를
      선언하고 사용하면 됩니다. 상태가 어디에 있는지, 어떻게 변하는지 코드를
      읽는 것만으로도 명확하게 파악할 수 있습니다.
      <br />
      <br />
      이러한 투명하고 자연스러운 흐름 속에서,
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        renew()
      </strong>
      는 "이제 화면을 갱신해줘"라고 명시적으로 요청하는 단순한 함수입니다.
      상태를 변경한 후 renew()를 호출하면 UI가 업데이트됩니다. 복잡한 의존성
      추적도, 예측하기 어려운 자동 렌더링도 없습니다.
      <br />
      <br />
      클로저라는 친숙한 개념 위에 renew()라는 단순한 API를 더한 것만으로, 언제
      무엇이 업데이트되는지 완전히 예측 가능하고 제어 가능한 UI를 만들 수
      있습니다. 이것이 Lithent가 추구하는 자연스러움입니다.
      <br />
      <br />
      별도의 상태 관리 메커니즘이 필요 없기 때문에 라이브러리는 경량을
      유지하면서도, 개발자는 JavaScript 본연의 방식으로 코드를 작성할 수
      있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      선언형 기반 (Light API Mode)
    </h2>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      상태 변화가 자동으로 UI에 반영되는 선언형 패턴입니다. 상태 생성을 위한
      lstate API는 코어와 느슨하게 결합된 helper를 통해 제공되며, 필요할 때만
      가볍게 가져다 사용할 수 있습니다. 상태, 컨텍스트 등 추가 기능이 필요할 때
      선택적으로 활용할 수 있습니다.
    </p>
    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        상태가 전혀 필요 없는 경우에는 mount나 lmount를 사용하지 않고 일반
        함수로 컴포넌트를 작성할 수도 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      점진적 적용
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Lithent는 다양한 형태의 웹 환경에서 사용 가능합니다:
    </p>
    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>빌드 단계없이 정적 HTML을 강화</li>
      <li>싱글 페이지 애플리케이션(SPA)</li>
      <li>서버 사이드 렌더링(SSR)</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/quick-start"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/quick-start');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          빠르게 시작하기 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          이제 Lithent에 대한 기본적인 철학을 알았습니다!
          <br />
          빠르게 시작하기에서 쉽게 Lithent를 시작하는 방법을 알아봐요.
        </p>
      </a>
    </div>
  </div>
);
