import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ChildrenKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Children
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Children이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Children은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트가 감싸고 있는 자식 요소들
      </strong>
      입니다.
      <br />
      <br />
      Lithent에서는 React와 달리{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        children이 props에 포함되지 않고 별도의 인자로 전달
      </strong>
      됩니다. 이는 props와 children을 명확히 분리하여 코드의 의도를 더 명확하게
      만드는 Lithent의 설계 철학입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Card = mount<{ title: string }>(
  (renew, props, children) => {  // children은 세 번째 인자!
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

// 사용
<Card title="My Card">
  <p>This is the card content</p>
  <button>Click me</button>
</Card>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      React와의 차이점
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 children을 props와 별도로 관리함으로써 구조적 명확성을
      제공합니다.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          React
        </h4>
        <CodeBlock
          language="tsx"
          code={`// React: children이 props에 포함됨
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
          code={`// Lithent: children이 별도 인자
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
          💡 왜 별도 인자로?
        </span>{' '}
        props는 컴포넌트의 설정 데이터이고, children은 컴포넌트가 감싸는
        구조입니다. 이 둘을 분리함으로써 각각의 역할이 명확해지고, 타입 안전성도
        향상됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      mount에서 children 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Container = mount<{ width: number }>(
  (renew, props, children) => {
    // children은 WDom[] 타입
    // 마운터 내부에서도 접근 가능
    console.log('Children count:', children.length);

    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);

// 사용
<Container width={300}>
  <h1>Title</h1>
  <p>Content</p>
</Container>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      lmount에서 children 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';

const Container = lmount<{ width: number }>(
  (props, children) => {  // lmount는 renew 없이 props, children만
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
      Mounter vs Updater에서의 children
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      중요한 특징:{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        children은 Mounter에서만 제공되고, Updater에서는 제공되지 않습니다.
      </strong>
      <br />
      <br />
      Mounter는 컴포넌트가 처음 마운트될 때 실행되며, 이때 children이 함께
      전달됩니다. 하지만 Updater는 props가 변경될 때만 실행되며, children은 이미
      Mounter에서 결정되었으므로 다시 전달되지 않습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Container = mount<{ title: string }>(
  // Mounter: renew, props, children 모두 제공
  (renew, props, children) => {
    console.log('Mounter - children:', children);

    // Updater: props만 제공 (children 없음!)
    return (props) => {
      console.log('Updater - props:', props);
      // children은 Updater에서 접근할 수 없음

      return (
        <div>
          <h1>{props.title}</h1>
          {/* 하지만 JSX에서는 사용 가능 (클로저로 캡처됨) */}
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
          💡 클로저 캡처:
        </span>{' '}
        Updater에서 children을 직접 인자로 받지는 않지만, Mounter에서 선언된
        children을 클로저를 통해 접근할 수 있습니다. children이 변경되면 부모
        컴포넌트의 리렌더링으로 전체 컴포넌트가 다시 평가되므로, Updater만
        실행되는 경우(props만 변경)에는 기존 children을 그대로 사용합니다.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      왜 Updater에서 children을 제공하지 않을까?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. Updater는 props 변경에만 반응
      </strong>
      <br />
      Updater는 컴포넌트의 props가 변경될 때만 실행됩니다. children이 변경되는
      경우는 부모 컴포넌트가 리렌더링되면서 전체 컴포넌트 트리가 다시
      평가되므로, Updater 시점에 children을 전달할 필요가 없습니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. 클로저를 통한 접근으로 충분
      </strong>
      <br />
      Mounter에서 받은 children은 클로저를 통해 Updater에서도 자유롭게 접근할 수
      있습니다. 별도로 인자를 전달하지 않아도 동일한 children 참조를 사용할 수
      있습니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. 명확한 책임 분리
      </strong>
      <br />
      Mounter는 컴포넌트의 초기 구조(children 포함)를 설정하고, Updater는 props
      데이터 변경에만 집중합니다. 이러한 분리가 각 함수의 역할을 더 명확하게
      만듭니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      내부 구조
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent 내부적으로 children은 가상 DOM 구조에서 props와 별도로 관리됩니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`// Lithent 내부 구조 (wDom.ts)
export interface WDom {
  type?: string | null;
  tag?: string;
  props?: Props;       // 컴포넌트 props
  children?: WDom[];   // 일반 요소의 children

  compProps?: Props;   // 커스텀 컴포넌트의 props
  compChild?: WDom[];  // 커스텀 컴포넌트의 children (별도 관리!)

  // ...
}

// h 함수 시그니처
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren  // children은 나머지 인자
) => {
  // ...
};`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 내부 구조:
        </span>{' '}
        Lithent는 일반 요소의 children과 컴포넌트의 children을 구분하여
        관리합니다. 컴포넌트의 경우 compProps와 compChild로 별도 저장되어
        업데이트 시 효율적으로 처리됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      레이아웃 컴포넌트
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

// 사용
<Layout sidebar={true}>
  <h1>Page Title</h1>
  <p>Page content goes here</p>
</Layout>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      조건부 렌더링
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

// 사용
<Accordion title="Details">
  <p>This content is hidden by default</p>
  <p>Click the title to reveal it</p>
</Accordion>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Children 조작
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

// 사용
<List ordered={false}>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>
// 결과:
// <ul>
//   <li><span>Item 1</span></li>
//   <li><span>Item 2</span></li>
//   <li><span>Item 3</span></li>
// </ul>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      슬롯 패턴 (Named Children)
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

// 사용
<Card
  header={<h2>Card Title</h2>}
  footer={<button>Action</button>}
>
  <p>This is the main content</p>
</Card>`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Render Props 패턴
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

// 사용
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
      Children 타입
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Children은 WDom 배열 타입입니다. TypeScript를 사용할 때 타입을 명시할 수
      있습니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { mount, WDom } from 'lithent';

// children 타입은 WDom[]
const Container = mount<{ title: string }>(
  (renew, props, children: WDom[]) => {
    // children 배열 조작 가능
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
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ props.children 없음:</span> Lithent에서는
        props.children으로 접근할 수 없습니다. 항상 별도의 children 인자를
        사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 인자 순서:</span> mount는 (renew, props,
        children) 순서이고, lmount는 (props, children) 순서입니다. 순서를 바꾸지
        마세요.
        <br />
        <br />
        <span class="font-medium">⚠️ children은 배열:</span> children은 항상
        WDom[] 배열입니다. 단일 child라도 배열 형태로 전달됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ Updater에서 제공 안 됨:</span> children은
        Mounter에서만 인자로 제공되며, Updater에서는 제공되지 않습니다. 하지만
        클로저를 통해 Mounter의 children에 접근할 수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
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
          Children 개념을 마스터했습니다!
          <br />
          이제 컴포넌트를 업데이트하는 Renewer에 대해 알아봅시다.
        </p>
      </a>
    </div>
  </div>
);
