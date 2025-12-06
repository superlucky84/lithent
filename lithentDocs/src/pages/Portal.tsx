import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Portal = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Portal
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is a Portal?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      A Portal{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        renders a component outside its parent DOM hierarchy
      </strong>
      .
      <br />
      <br />
      Normally, components render inside their parent&apos;s DOM tree. But UI
      like{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        modals
      </strong>{' '}
      or{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        tooltips
      </strong>{' '}
      often need to float above everything else. Parent styles such as{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        z-index
      </code>{' '}
      can clip or hide them.
      <br />
      <br />
      Portals solve this by letting you render a component at a completely
      different place in the DOM, while its state and lifecycle still live with
      its logical parent.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      The simplest Portal usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The most common pattern is to render into{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        document.body
      </code>
      . Here is a modal example:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

const Modal = mount<{ onClose: () => void }>(() => {
  return ({ onClose }) => (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Modal Title</h2>
        <p>This modal is rendered outside the parent DOM!</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

const App = mount((renew) => {
  let showModal = false;

  const openModal = () => {
    showModal = true;
    renew();
  };

  const closeModal = () => {
    showModal = false;
    renew();
  };

  return () => (
    <div class="app-container" style="overflow: hidden; position: relative;">
      {/* Even if the parent container has overflow: hidden */}
      <h1>My App</h1>
      <button onClick={openModal}>Open Modal</button>

      {/* The modal is rendered into document.body and displays correctly */}
      {showModal && portal(
        <Modal onClose={closeModal} />,
        document.body
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In this example, the App container uses{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>
      , but the modal is rendered into <code>document.body</code>, so it can
      cover the entire viewport without being clipped.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Portal API
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The <code>portal()</code> helper takes two arguments:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { portal } from 'lithent';

portal(
  wDom,           // Virtual DOM to render
  targetElement   // Target HTMLElement (e.g. document.body)
)`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      •{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">wDom</strong>
      : the component or JSX tree to render
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        targetElement
      </strong>
      : the real DOM element where the Portal should render
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using predefined containers in HTML
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In larger apps it&apos;s common to define dedicated Portal containers in
      your HTML. This makes it easier to layer and manage modals and tooltips:
    </p>

    <CodeBlock
      language="html"
      code={`<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <!-- Dedicated Portal containers -->
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
</html>`}
    />

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

const Toast = mount<{ message: string; type: 'success' | 'error' }>(() => {
  return ({ message, type }) => (
    <div class={\`toast toast-\${type}\`}>
      {message}
    </div>
  );
});

const App = mount((renew) => {
  let toastMessage = null;

  const showSuccess = () => {
    toastMessage = { message: 'Success!', type: 'success' };
    renew();

    // Automatically hide after 3 seconds
    setTimeout(() => {
      toastMessage = null;
      renew();
    }, 3000);
  };

  return () => (
    <div>
      <button onClick={showSuccess}>Show Toast</button>

      {/* Render into the modal-root container */}
      {toastMessage && portal(
        <Toast {...toastMessage} />,
        document.getElementById('modal-root')!
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Advantages of this approach:
      <br />
      <br />• Easier <code>z-index</code> management by separating modals,
      tooltips, etc.
      <br />
      • Clearer CSS targeting
      <br />• DOM structure is easier to inspect while debugging
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using Portals from nested components
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Portals work just fine from deeply nested components. State and lifecycle
      stay with the logical parent:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

// Nested child component
const ConfirmDialog = mount<{ message: string; onConfirm: () => void }>(() => {
  return ({ message, onConfirm }) => (
    <div class="dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
});

// Intermediate component
const UserCard = mount<{ name: string }>((renew) => {
  let showDialog = false;

  const deleteUser = () => {
    showDialog = true;
    renew();
  };

  const confirmDelete = () => {
    console.log('User deleted!');
    showDialog = false;
    renew();
  };

  return ({ name }) => (
    <div class="card">
      <h3>{name}</h3>
      <button onClick={deleteUser}>Delete</button>

      {/* Portals work even from nested components */}
      {showDialog && portal(
        <ConfirmDialog
          message={\`Delete \${name}?\`}
          onConfirm={confirmDelete}
        />,
        document.body
      )}
    </div>
  );
});

// Parent component
const App = mount(() => {
  return () => (
    <div class="app" style="overflow: hidden;">
      <UserCard name="Alice" />
      <UserCard name="Bob" />
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In this example, <code>UserCard</code> is a child of <code>App</code>, and
      <code>ConfirmDialog</code> is a child of <code>UserCard</code>. The dialog
      still renders into <code>document.body</code>, so it is unaffected by
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>{' '}
      on the App container.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How Portals work internally
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Internally, Portals behave like this:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              portal(wDom, element)
            </code>{' '}
            creates a special <code>portal</code> virtual DOM node
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>
            When rendering, the Portal node itself is not added to the parent
            DOM tree; instead, the given HTMLElement is used as the container
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>
            Components inside the Portal share state and lifecycle with their
            parent component
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            When the parent calls <code>renew()</code>, the Portal content
            updates as well
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>
            When the parent unmounts, the Portal content is cleaned up too
          </span>
        </li>
      </ol>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Things to watch out for
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Event bubbling:</span> Events fired inside
        a Portal bubble along the <strong>component tree</strong>, not the DOM
        tree. For example, clicks inside a modal may bubble to its parent
        component, so you might need to call{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          e.stopPropagation()
        </code>
        .
        <br />
        <br />
        <span class="font-medium">⚠️ CSS styling:</span> Portal content inherits
        CSS from where it is rendered, not from its logical parent. Treat Portal
        components as visually independent and style them accordingly.
        <br />
        <br />
        <span class="font-medium">⚠️ Server-side rendering:</span> Portals only
        work in a browser environment. In SSR you may need a guard such as{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          typeof window !== 'undefined'
        </code>
        .
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mount-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mount-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Mount Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about <code>mountCallback</code> and{' '}
          <code>mountReadyCallback</code>, the hooks that run when a component
          mounts.
          <br />
          They give you fine-grained control over the component lifecycle.
        </p>
      </a>

      <a
        href="/examples/20"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/20');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: image gallery lightbox →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Try the example that uses Portals to open a full-screen lightbox on
          top of an <code>overflow: hidden</code> gallery container.
        </p>
      </a>
    </div>
  </div>
);
