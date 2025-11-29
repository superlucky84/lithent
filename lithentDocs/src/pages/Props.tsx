import { CodeBlock } from '@/components/CodeBlock';

export const Props = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mounter
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount 함수
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      마운터는 mount 함수의 인자로서 포함되는 함수입니다.
      <br />
      컴포넌트가 처음 그려질 때{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        단 한 번 호출
      </strong>
      됩니다. 컴포넌트의 상태와 메서드를 정의합니다.
      <br />
      <br />
      아래 예제는 초기값 0을 갖는 count 라는 상태와, 값을 1씩 증가시키는
      increase라는 메서드를 정의되어 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  // Updater
  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mount 함수의 첫번째 인자로서 꺼내어 사용할수 있는
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        renew
      </strong>
      는 컴포넌트 갱신 함수입니다.
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Renewer
      </strong>
      섹션에서 더 자세히 다룹니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      저 마운트 함수는 jsx 표현식이 있는 또 다른 함수를 리턴하고 있는데,
      업데이터라고 합니다. 업데이터는 다음 단계에서 더 자세히 다루겠습니다.
    </p>

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      props
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mount 함수의 제네릭으로 props의 타입을 정의 가능합니다. props는 이
      컴포넌트의 생명 주기내내 같은 참조를 유지합니다.
      <br />
      <br />
      props는 외부에서부터의 값을 컴포넌트에서 사용할수 있습니다. 아래 예제는
      appVersion 이라는 문자열을 props로 넘겨받는 예입니다.
      <br />
      <br />
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount<{ appVersion: string }>((_renew, props) => {
  // Updater
  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{count}</p>
      <p>{props.appVersion}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});

render(<App appVersion="2.0.0">, document.getElementById('root'));`}
    />
  </div>
);
