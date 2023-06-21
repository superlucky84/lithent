import { h, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, state } from 'lithent';
const Nested = mount(function (r) {
  const choiceNode = state<number>(7, r);

  const shuffle = () => {
    const randomValue = Math.floor(Math.random() * 10) + 1;
    choiceNode.v = randomValue;
  };

  return () => (
    <Fragment>
      {choiceNode.v === 1 && <div>1</div>}
      {choiceNode.v === 2 && <div>2</div>}
      <Fragment>
        {choiceNode.v === 3 && <div>3</div>}
        {choiceNode.v === 4 && <div>4</div>}
        <Fragment>
          {choiceNode.v === 5 && <div>5</div>}
          {choiceNode.v === 6 && <div>6</div>}
          <div>6.5</div>
          {choiceNode.v === 7 && <div>7</div>}
        </Fragment>
        {choiceNode.v === 8 && <div>8</div>}
        {choiceNode.v === 9 && <div>9</div>}
      </Fragment>
      {choiceNode.v === 10 && <div>10</div>}
      <div>11</div>
      <button onClick={shuffle}>shuffle</button>
    </Fragment>
  );
});

render(<Nested />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Nested = mount(function (r) {
  const choiceNode = state<number>(7, r);

  const shuffle = () => {
    const randomValue = Math.floor(Math.random() * 10) + 1;
    choiceNode.v = randomValue;
  };

  return () => (
    <Fragment>
      {choiceNode.v === 1 && <div>1</div>}
      {choiceNode.v === 2 && <div>2</div>}
      <Fragment>
        {choiceNode.v === 3 && <div>3</div>}
        {choiceNode.v === 4 && <div>4</div>}
        <Fragment>
          {choiceNode.v === 5 && <div>5</div>}
          {choiceNode.v === 6 && <div>6</div>}
          <div>6.5</div>
          {choiceNode.v === 7 && <div>7</div>}
        </Fragment>
        {choiceNode.v === 8 && <div>8</div>}
        {choiceNode.v === 9 && <div>9</div>}
      </Fragment>
      {choiceNode.v === 10 && <div>10</div>}
      <div>11</div>
      <button
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
        onClick={shuffle}
      >
        shuffle
      </button>
    </Fragment>
  );
});

export const Example5 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 5 - Nested Fragment
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        This code tests that "Lithent" is good at finding and updating values
        when there are multiple nested fragments.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Nested />
      </div>
    </div>
  );
});
