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
      A mounter is the function you pass into the <code>mount</code> API.
      <br />
      It is called{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        exactly once when the component is first rendered
      </strong>
      and is responsible for defining the component&apos;s state and methods.
      <br />
      <br />
      In the example below, the mounter defines a <code>count</code> state with
      an initial value of <code>0</code> and an <code>increase</code> function
      that increments it by 1.
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
  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The first argument passed into <code>mount</code>,{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        renew
      </strong>
      , is the function used to trigger a re-render of the component.
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Renewer
      </strong>
      covers this behavior in more detail.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The mounter returns another function that contains the JSX expression.
      This returned function is called the updater, which we will explore in the
      next section.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent&apos;s core model is to manage state via plain closures: you use
      normal variables as state and call the <code>renew</code> API to refresh
      the UI.
      <br />
      <br />
      However, many developers are used to a React-like pattern where state
      changes automatically trigger UI updates. In those cases, explicitly
      calling <code>renew</code> can feel noisy or cumbersome.
      <br />
      <br />
      Instead of <code>mount</code>, you can pair{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lmount
      </strong>{' '}
      with{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lstate
      </strong>{' '}
      to get a more automatic, reactive style. In the example below,
      <code>lstate</code> stores the state, and any change to its{' '}
      <code>value</code> property immediately re-renders the UI.
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
  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{countRef.count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Thanks to <code>lstate</code>, you no longer need the <code>renew</code>{' '}
      API, so <code>lmount</code> does not expose it and components stay more
      concise.
      <br />
      <br />
      Because <code>lstate</code> comes from a helper module, you will ship a
      slightly larger bundle than with the Core-only setup—but in many apps the
      ergonomics are worth it.
      <br />
      <br />
      This mode still uses closures under the hood, but since{' '}
      <code>lstate</code> hides explicit <code>renew</code> calls, it can make
      the &quot;closure-based&quot; mental model of Lithent feel less obvious.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Data fetching example
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Fetching data inside a mounter is a pattern reserved for{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        specific, constrained use cases
      </strong>
      .
      <br />
      <br />
      It is helpful when you need to fetch data{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        exactly once for the lifetime of the component
      </strong>
      . The mounter only runs when the component is first created, so even if
      props change later, the data will not be re-fetched.
      <br />
      <br />A typical example is loading detail data based on an ID from the
      URL: you only need to fetch once when the page loads. If you need to
      re-fetch when props change, use <code>updateCallback</code> or{' '}
      <code>effect</code> instead.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In the example below, the component receives a Pokemon name via props and
      calls the API once when the component mounts. A <code>loading</code> flag
      is used to indicate progress and update the UI once the data arrives.
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
      The <code>loadDetail</code> function is{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        executed exactly once when the component first mounts
      </strong>
      .
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        This pattern is not a good fit if the user should browse multiple
        Pokemon in the same view. If you want to fetch another Pokemon on button
        click, move the fetching logic into an event handler instead of the
        mounter. If new data should load whenever props change, use{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          updateCallback
        </code>{' '}
        or{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          effect
        </code>{' '}
        instead.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
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
          Core feature: Updater →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          If the mounter runs only once, the updater runs every time state
          changes.
          <br />
          Learn how the updater builds new virtual DOM and updates the screen.
        </p>
      </a>
    </div>
  </div>
);
