import { CodeBlock } from '@/components/CodeBlock';
import { Example5 } from '@/components/examples/example5';
import type { Introduction } from '@/pages/Introduction';

const example5Code = `import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: string;
  content: string;
  time: string;
  read: boolean;
}

const NotificationCenter = mount(r => {
  const notifications = state<Notification[]>([...], r);
  const filters = state({
    like: true,
    comment: true,
    follow: true,
    system: true,
  }, r);

  const toggleFilter = (type) => {
    filters.v = { ...filters.v, [type]: !filters.v[type] };
  };

  return () => {
    const likes = notifications.v.filter(n => n.type === 'like');
    const comments = notifications.v.filter(n => n.type === 'comment');
    const follows = notifications.v.filter(n => n.type === 'follow');
    const systems = notifications.v.filter(n => n.type === 'system');

    return (
      <>
        {/* 중첩된 Fragment 구조 */}
        <Fragment>
          {/* Likes Fragment Group */}
          {filters.v.like && (
            <Fragment>
              {likes.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* Comments Fragment Group */}
          {filters.v.comment && (
            <Fragment>
              {comments.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* 더 깊게 중첩된 Fragment */}
          <Fragment>
            {filters.v.follow && (
              <Fragment>
                {follows.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}

            {filters.v.system && (
              <Fragment>
                {systems.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}
          </Fragment>
        </Fragment>
      </>
    );
  };
});
`;

export const Example5Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Nested Fragments (Notification Center)
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This example implements a notification center using nested{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Fragment
      </code>
      s. Each notification type (like, comment, follow, system) is grouped into
      its own Fragment section, and filter buttons let you toggle each group on
      and off.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        test how Lithent&apos;s virtual DOM engine handles deeply nested
        Fragment structures and updates them efficiently
      </strong>
      .
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When you change filters, DOM nodes are added and removed at the Fragment
      boundaries, and the diff algorithm continues to work correctly even with
      multiple levels of nesting.
    </p>

    <CodeBlock language="typescript" code={example5Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example5 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Benefits of nested Fragment structures
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Logical grouping</strong>: group related elements with
          Fragments to make structure clearer.
        </li>
        <li>
          <strong>Efficient updates</strong>: only the affected Fragment groups
          are added/removed when filters change.
        </li>
        <li>
          <strong>Clean DOM</strong>: Fragments do not create real DOM nodes, so
          there are no unnecessary wrapper elements.
        </li>
        <li>
          <strong>Flexible structure</strong>: multiple nesting levels make it
          easy to express complex conditional rendering.
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/children"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/children');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Children guide
          </a>{' '}
          - Summarizes how Fragments and children shape the render tree.
        </li>
        <li>
          <a
            href="/guide/updater"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/updater');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Updater guide
          </a>{' '}
          - Explains how Fragment groups are updated when filters change, from
          the updater&apos;s perspective.
        </li>
      </ul>
    </div>
  </div>
);
