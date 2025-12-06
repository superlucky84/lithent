import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Children = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Children
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What are children?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Children are the{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        elements a component wraps around
      </strong>
      .
      <br />
      <br />
      Unlike React, Lithent{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        passes children as a separate argument instead of bundling them into
        props
      </strong>
      . This separation reflects Lithent&apos;s design philosophy of keeping
      configuration (props) and structure (children) clearly distinct.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Card = mount<{ title: string }>(
  (renew, props, children) => {  // children is the third argument!
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div class="card-body">
          {children}
        </div>
      </div>
    );
  }
);

// Usage
<Card title="My Card">
  <p>This is the card content</p>
  <button>Click me</button>
</Card>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Differences from React
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent keeps children and props separate to make component structure
      easier to reason about.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          React
        </h4>
        <CodeBlock
          language="tsx"
          code={`// React: children is part of props
const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Lithent
        </h4>
        <CodeBlock
          language="tsx"
          code={`// Lithent: children is a separate argument
const Card = mount(
  (renew, props, children) => {
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div>{children}</div>
      </div>
    );
  }
);`}
        />
      </div>
    </div>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Why a separate argument?
        </span>{' '}
        Props describe configuration for a component, while children describe
        the nested structure. Keeping them separate clarifies intent and
        improves type safety.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic usage
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Using children with mount
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Container = mount<{ width: number }>(
  (renew, props, children) => {
    // children has type WDom[]
    // You can access it inside the mounter
    console.log('Children count:', children.length);

    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);

// Usage
<Container width={300}>
  <h1>Title</h1>
  <p>Content</p>
</Container>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using children with lmount
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';

const Container = lmount<{ width: number }>(
  (props, children) => {  // lmount passes only props and children
    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Children in the mounter vs the Updater
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      A key detail:{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        children are only passed into the mounter, not into the Updater.
      </strong>
      <br />
      <br />
      The mounter runs when the component is first mounted and receives children
      at that time. The Updater, on the other hand, only runs when props change.
      Because children are already fixed by the mounter, they do not need to be
      passed again to the Updater.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Container = mount<{ title: string }>(
  // Mounter: receives renew, props, and children
  (renew, props, children) => {
    console.log('Mounter - children:', children);

    // Updater: receives only props (no children argument)
    return (props) => {
      console.log('Updater - props:', props);
      // children cannot be accessed as an argument in the Updater

      return (
        <div>
          <h1>{props.title}</h1>
          {/* children still available via closure */}
          {children}
        </div>
      );
    };
  }
);`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Closure capture:
        </span>{' '}
        Even though the Updater does not receive children as an argument, it can
        still access the children defined in the mounter through closure.
        Whenever children truly change, the parent re-renders and the entire
        component is re-evaluated. When only props change, the Updater reuses
        the same children reference.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Why doesn&apos;t the Updater receive children?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. The Updater only reacts to prop changes
      </strong>
      <br />
      The Updater runs when props change. When children change, the parent
      re-renders and the whole component tree is re-evaluated, so there is no
      need to pass children as a separate argument at Updater time.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. Closures already provide access
      </strong>
      <br />
      Children received by the mounter are still available in the Updater via
      closure, so there is no need to pass them again.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. Clear separation of responsibilities
      </strong>
      <br />
      The mounter is responsible for setting up initial structure (including
      children), while the Updater focuses purely on prop-driven updates. This
      keeps each function&apos;s role clear.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Internal representation
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Internally, Lithent keeps children separate from props in the virtual DOM
      structure.
    </p>

    <CodeBlock
      language="typescript"
      code={`// Lithent internal structure (wDom.ts)
export interface WDom {
  type?: string | null;
  tag?: string;
  props?: Props;       // Props for regular elements
  children?: WDom[];   // Children of regular elements

  compProps?: Props;   // Props of custom components
  compChild?: WDom[];  // Children of custom components (managed separately)

  // ...
}

// h function signature
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren  // children are the rest arguments
) => {
  // ...
};`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Internal layout:
        </span>{' '}
        Lithent distinguishes between children of regular elements and children
        of components. Component props are stored in <code>compProps</code> and
        component children in <code>compChild</code>, which helps the runtime
        handle updates efficiently.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Layout components
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Layout = mount<{ sidebar: boolean }>(
  (renew, props, children) => {
    return () => (
      <div class="layout">
        {props.sidebar && (
          <aside class="sidebar">
            <nav>Navigation</nav>
          </aside>
        )}
        <main class="content">
          {children}
        </main>
      </div>
    );
  }
);

// Usage
<Layout sidebar={true}>
  <h1>Page Title</h1>
  <p>Page content goes here</p>
</Layout>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Conditional rendering
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Accordion = mount<{ title: string }>(
  (renew, props, children) => {
    const isOpen = state(false, renew);

    return () => (
      <div class="accordion">
        <button
          onClick={() => (isOpen.value = !isOpen.value)}
          class="accordion-header"
        >
          {props.title}
          <span>{isOpen.value ? '▼' : '▶'}</span>
        </button>
        {isOpen.value && (
          <div class="accordion-body">
            {children}
          </div>
        )}
      </div>
    );
  }
);

// Usage
<Accordion title="Details">
  <p>This content is hidden by default</p>
  <p>Click the title to reveal it</p>
</Accordion>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Transforming children
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const List = mount<{ ordered: boolean }>(
  (renew, props, children) => {
    const Tag = props.ordered ? 'ol' : 'ul';

    return () => (
      <Tag>
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </Tag>
    );
  }
);

// Usage
<List ordered={false}>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>
// Result:
// <ul>
//   <li><span>Item 1</span></li>
//   <li><span>Item 2</span></li>
//   <li><span>Item 3</span></li>
// </ul>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Slot pattern (named children)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

interface CardSlots {
  header?: JSX.Element;
  footer?: JSX.Element;
}

const Card = mount<CardSlots>(
  (renew, props, children) => {
    return () => (
      <div class="card">
        {props.header && (
          <div class="card-header">
            {props.header}
          </div>
        )}
        <div class="card-body">
          {children}
        </div>
        {props.footer && (
          <div class="card-footer">
            {props.footer}
          </div>
        )}
      </div>
    );
  }
);

// Usage
<Card
  header={<h2>Card Title</h2>}
  footer={<button>Action</button>}
>
  <p>This is the main content</p>
</Card>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Render props pattern
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface MouseTrackerProps {
  render: (x: number, y: number) => JSX.Element;
}

const MouseTracker = mount<MouseTrackerProps>(
  (renew, props, children) => {
    const x = state(0, renew);
    const y = state(0, renew);

    const handleMouseMove = (e: MouseEvent) => {
      x.value = e.clientX;
      y.value = e.clientY;
    };

    return () => (
      <div
        onMouseMove={handleMouseMove}
        style={{ height: '100vh' }}
      >
        {props.render(x.value, y.value)}
        {children}
      </div>
    );
  }
);

// Usage
<MouseTracker
  render={(x, y) => (
    <div>
      Mouse position: {x}, {y}
    </div>
  )}
>
  <p>Move your mouse around</p>
</MouseTracker>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Children type
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Children are represented as an array of <code>WDom</code>. You can
      annotate this explicitly when using TypeScript.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { mount, WDom } from 'lithent';

// children has type WDom[]
const Container = mount<{ title: string }>(
  (renew, props, children: WDom[]) => {
    // You can freely transform the children array
    const hasChildren = children.length > 0;

    return () => (
      <div>
        <h1>{props.title}</h1>
        {hasChildren ? children : <p>No content</p>}
      </div>
    );
  }
);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Things to watch out for
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ No props.children:</span> In Lithent you
        cannot access children via <code>props.children</code>. Always use the
        separate <code>children</code> argument.
        <br />
        <br />
        <span class="font-medium">⚠️ Argument order:</span> For
        <code>mount</code>, the order is <code>(renew, props, children)</code>.
        For <code>lmount</code>, it is <code>(props, children)</code>. Do not
        swap them.
        <br />
        <br />
        <span class="font-medium">⚠️ Children are arrays:</span> Children are
        always passed as a <code>WDom[]</code> array, even when there is only a
        single child.
        <br />
        <br />
        <span class="font-medium">⚠️ Not passed to the Updater:</span> Children
        are only provided to the mounter as an argument. In the Updater you
        should rely on closure to access them.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/renewer"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/renewer');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core: Renewer →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          You now have a solid grasp of children.
          <br />
          Next, dive into Renewer to learn how components are updated.
        </p>
      </a>
    </div>
  </div>
);
