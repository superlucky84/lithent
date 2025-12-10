import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Render = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Render
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What does render() do?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The <code>render()</code> function{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        mounts a component into the real DOM
      </strong>
      . It turns virtual DOM into real DOM nodes and attaches them to the
      container element you specify.
      <br />
      <br />
      <code>render()</code> also{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        returns a destroy function
      </strong>
      so you can unmount the component later.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// Render the component into the #root element
const destroy = render(<App />, document.getElementById('root'));

// Unmount later if needed
// destroy();`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The first argument to <code>render()</code> is the virtual DOM you want to
      render; the second is the container element. If you omit the container,
      the component is rendered into <code>document.body</code> by default.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      render() signature
    </h2>

    <CodeBlock
      language="tsx"
      code={`render(
  wDom: VirtualDOM,           // Virtual DOM to render
  wrapElement?: HTMLElement,  // Container element (default: document.body)
  afterElement?: HTMLElement  // Reference element for insertBefore (optional)
): () => void                 // Returns a destroy function`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code>render()</code> takes three parameters:
      <br />
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">wDom</strong>
      : the virtual DOM to render (required)
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        wrapElement
      </strong>
      : the container element (optional, defaults to <code>document.body</code>)
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        afterElement
      </strong>
      : a reference element used when inserting before a specific node
      (optional)
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The most common pattern is to render a component into a specific DOM node.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const Greeting = mount(() => {
  return () => <h1>Hello, Lithent!</h1>;
});

// Render into the #app element
render(<Greeting />, document.getElementById('app'));

// Or use document.querySelector
render(<Greeting />, document.querySelector('.container'));

// If you omit the container, it renders into document.body
render(<Greeting />);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Unmounting
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Calling the destroy function returned by <code>render()</code> removes the
      component from the DOM, unregisters event listeners, and runs any
      registered cleanup callbacks.
      <br />
      <br />
      If your component needs to clean up resources (timers, event listeners,
      etc.) when it unmounts, use the{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        mountCallback hook
      </strong>
      . When you return a cleanup function from <code>mountCallback</code>, it
      runs automatically on unmount.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let count = 0;

  // Register work to run on mount via mountCallback
  mountCallback(() => {
    // Start a timer when the component mounts
    const intervalId = setInterval(() => {
      count += 1;
      renew();
    }, 1000);

    // Return a cleanup function – runs automatically on unmount
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {count} seconds</div>;
});

const destroy = render(<Timer />, document.getElementById('root'));

// Remove the timer component after 5 seconds
setTimeout(() => {
  destroy(); // Unmount the component and run cleanup
}, 5000);`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When you call <code>destroy()</code>:
      <br />
      <br />
      1. The cleanup function returned from <code>mountCallback</code> runs
      <br />
      2. All event listeners are detached
      <br />
      3. The rendered DOM nodes are removed
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Inserting before a specific element
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Using the third parameter, <code>afterElement</code>, you can insert a
      component before a specific DOM node.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const NewItem = mount(() => {
  return () => <li>New Item</li>;
});

// HTML structure:
// <ul id="list">
//   <li>Item 1</li>
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>

const container = document.getElementById('list');
const referenceElement = document.getElementById('item2');

// Insert New Item before Item 2
render(<NewItem />, container, referenceElement);

// Result:
// <ul id="list">
//   <li>Item 1</li>
//   <li>New Item</li>      ← inserted here
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This is useful when you need to insert a component at a dynamic position
      within existing DOM.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Rendering multiple components
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can render multiple independent components into different parts of the
      page.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const Header = mount(() => {
  return () => <header>Header</header>;
});

const Sidebar = mount(() => {
  return () => <aside>Sidebar</aside>;
});

const Content = mount(() => {
  return () => <main>Content</main>;
});

// Render each component independently
const destroyHeader = render(<Header />, document.getElementById('header'));
const destroySidebar = render(<Sidebar />, document.getElementById('sidebar'));
const destroyContent = render(<Content />, document.getElementById('content'));

// Unmount each independently when needed
// destroyHeader();
// destroySidebar();
// destroyContent();`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        In many apps it&apos;s simpler to render a single root component and
        compose everything else inside it. When you truly need multiple roots,
        consider wrapping them in a parent component to keep data flow
        predictable.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How render() works internally
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When <code>render()</code> is called, Lithent goes through these steps:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>Convert the virtual DOM into real DOM nodes (wDomToDom)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>
            Attach nodes to the container (appendChild or insertBefore)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Run mountCallback hooks (when registered)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>Run mountReadyCallback hooks (when registered)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>Return the destroy function</span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This sequence turns the virtual DOM into pixels on the screen and ensures
      lifecycle hooks fire in a well-defined order.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/portal"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/portal');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Portal →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to render components outside of their parent DOM hierarchy
          using Portals.
          <br />
          This is especially useful for modals, tooltips, and other UI that
          needs to escape overflow boundaries.
        </p>
      </a>

      <a
        href="/examples/16"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/16');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: insertBefore + Destroy →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          See a practical example of inserting a Lithent component between
          existing DOM nodes using insertBefore, then cleaning it up with the
          destroy function.
        </p>
      </a>
    </div>
  </div>
);
