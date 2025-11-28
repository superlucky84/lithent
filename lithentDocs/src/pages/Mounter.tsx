import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Mounter = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mounter
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount
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

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 네이티브 클로저 기반의 상태관리를 컨셉으로 하기 때문에, 일반적인
      변수 정의를 상태값으로 활용하고 renew api를 이용해 갱신하는것이 기본
      컨셉입니다.
      <br />
      <br />
      하지만 보통 상태변경이 즉각적으로 ui에 반영되는 React-like 방식에 익숙하기
      때문에 어색할 수 있으며, 상황에따라 renew api를 이용하는 방식이 쓸대없이
      불편할 수 있습니다.
      <br />
      <br />
      mount 대신
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lmount
      </strong>
      와
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lstate
      </strong>
      를 함께 사용하면 를 사용하면 상태변경이 즉각적으로 ui변경을 트리거 할수
      있습니다. 아래 예제를 보면 lstate를 사용하여 상태를 저장하고, lstate의
      value 속성이 변경되면 즉각적으로 ui에 반영됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount((_props) => {
  const countRef = lstate(0);

  const increase = () => {
    countRef.value += 1;
  };

  // Updater
  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{countRef.count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate 덕분에 renew api의 필요성이 없어졌으므로 renew를 제공하지 않는
      lmount를 사용하여 더 간결하게 컴포넌트를 정의하여 사용 가능합니다.
      <br />
      <br />
      lstate를 사용하므로서 core모듈 외에 별도의 helper 모듈을 추가로 사용해야
      하므로 번들사이즈가 약간 늘어날 수 있는 단점이 있지만 유용합니다.
      <br />
      <br />이 모드도 여전히 클로저를 이용한 상태관리인 점은 마찬가지지만
      lstate에서 값 변경시 renew 호출을 대신해주므로 사용자는 클로저기반으로
      동작한다는 Lithent의 멘탈 모델 인지가 약해지는 단점이 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      데이터 가져오기 예시
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      마운터에서 데이터를 가져오는 것은
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        특수한 상황
      </strong>
      에 사용되는 패턴입니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        컴포넌트와 생명주기를 함께하는 데이터를 딱 한 번만 가져올 때
      </strong>
      유용합니다. 마운터는 컴포넌트가 처음 생성될 때 단 한 번만 실행되므로, 이후
      props가 변경되어도 데이터를 다시 가져오지 않습니다.
      <br />
      <br />
      예를 들어, URL의 ID 파라미터로 특정 상세 페이지에 접근했을 때, 그 ID에
      해당하는 데이터를 한 번만 로드하면 되는 경우에 적합합니다. 만약 props
      변경에 따라 데이터를 다시 가져와야 한다면, updateCallback이나 effect 같은
      다른 방법을 사용해야 합니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      아래는 포켓몬 이름을 props로 받아서, 컴포넌트 마운트 시 단 한 번 API를
      호출하는 예제입니다. loading 상태를 통해 로딩 중임을 사용자에게 알리고,
      데이터를 가져온 후 화면을 업데이트합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

type Props = { name: string };

const PokemonDetail = lmount<Props>(({ name }) => {
  const detail = lstate({ img: '', info: '', title: name });
  const loading = lstate(true);

  const loadDetail = async (pokemonName: string) => {
    try {
      loading.value = true;
      const response = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${pokemonName}\`);
      const data = await response.json();

      detail.value = {
        img: data.sprites.other.dream_world.front_default,
        info: \`Types: \${data.types.map(t => t.type.name).join(', ')}\`,
        title: data.name
      };
    } catch (err) {
      console.error('Failed to load Pokemon', err);
      detail.value = { img: '', info: 'Failed to load', title: pokemonName };
    } finally {
      loading.value = false;
    }
  };

  loadDetail(name);

  return () => (
    <div>
      <h2>{detail.value.title}</h2>
      {loading.value ? (
        <p>Loading...</p>
      ) : (
        <div>
          <img src={detail.value.img} alt={detail.value.title} />
          <p>{detail.value.info}</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      loadDetail 함수는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        컴포넌트가 처음 마운트될 때 단 한 번만 실행
      </strong>
      됩니다.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        이후 다른 포켓몬을 보고 싶다면, 이 컴포넌트는 적합하지 않습니다. 버튼
        클릭으로 다른 포켓몬 데이터를 가져와야 한다면 마운터가 아닌 이벤트
        핸들러에서 처리해야 하고, props가 변경될 때마다 새로운 데이터를 가져와야
        한다면{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          updateCallback
        </code>
        이나{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          effect
        </code>
        를 사용해야 합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/updater"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/updater');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Updater →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          마운터가 단 한 번 실행된다면, Updater는 상태가 변경될 때마다
          호출됩니다.
          <br />
          새로운 Virtual DOM을 생성하고 화면을 업데이트하는 Updater의 동작
          원리를 알아보세요.
        </p>
      </a>
    </div>
  </div>
);
