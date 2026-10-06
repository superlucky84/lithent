import { CodeBlock } from '@/components/CodeBlock';
import { ElementDemo } from '@/components/ElementDemo';
import { navigateTo } from '@/store';

const copy = {
  en: {
    title: 'Custom Elements (lithent/element)',
    intro:
      'lithent/element registers a lithent component as a standard Custom Element. The host page needs no knowledge of lithent: it adds a script and a tag, sets attributes or properties, and listens to DOM events. That makes it a fit for UI that lives on pages you do not own, such as payment buttons, chat or review widgets, and shared headers, whether the page is plain HTML, a server-rendered template or a React or Vue app. The wrapper adds under 1 KB (brotli) to the core and needs no build step.',
    define: 'Define an element',
    defineText:
      'Pass a mount or lmount component unchanged. Props are declared with constructors; the element observes each one as a kebab-case attribute and also exposes it as a property.',
    use: 'Use it on any page',
    useText:
      'With the UMD builds there is no build step. The element upgrades even if the tag was in the HTML before the script ran, and keeps a property assigned before that.',
    demo: 'Try it',
    demoText:
      'The button below is the element. The page around it only sets the amount and listens to the pay event.',
    props: 'Attributes and properties',
    propsRows: [
      ['String', 'the attribute value', 'undefined'],
      ['Number', 'a number; not a number becomes undefined', 'undefined'],
      ['Boolean', 'true while the attribute is present, even "false"', 'false'],
      [
        'Object',
        'JSON.parse of the value; invalid JSON becomes undefined',
        'undefined',
      ],
    ],
    propsHead: ['Declared as', 'From the attribute', 'When absent'],
    propsText:
      'Properties take any value without conversion, so pass objects, arrays and functions as properties. Properties are not reflected back to attributes. Changes made in the same task render once.',
    events: 'Events out of the element',
    eventsText:
      'The component receives the element as props.host. emit dispatches a CustomEvent on it that bubbles, is composed and is cancelable; it returns false when a listener called preventDefault(), so a widget can offer "before" events.',
    styles: 'Styles and customization',
    stylesText:
      'By default the component renders into an open shadow root, so page CSS does not reach in and widget CSS does not leak out. That is why the widget brings its CSS: styles are shared by every instance through one adopted style sheet, with a <style> fallback where that API is missing. Let host pages theme the widget with CSS custom properties and ::part(), which cross the shadow boundary.',
    options: 'Options',
    optionsRows: [
      [
        'props',
        'Prop declarations: { name: String | Number | Boolean | Object }',
      ],
      [
        'shadow',
        "true / 'open' (default), 'closed', or false to render into the element itself",
      ],
      [
        'styles',
        'CSS strings for the shadow root; ignored when shadow is false',
      ],
    ],
    slots: 'Children and slots',
    slotsText:
      'In shadow mode, render a <slot> to show the element’s own children, named slots included. With shadow: false the element owns its children: anything inside it, such as server fallback content, is replaced on mount.',
    lifecycle: 'Lifecycle',
    lifecycleItems: [
      'Connecting the element mounts the component; removing it unmounts the component after a microtask, running mountCallback cleanups.',
      'Moving the element (appendChild elsewhere, or remove() and insert in the same task) keeps the instance and its state.',
      'Where Custom Elements do not exist (SSR, Node), defineElement returns undefined instead of throwing. Defining a taken name returns the existing constructor.',
      'The element works with the base and the concurrent core.',
    ],
    types: 'TypeScript',
    typesText:
      'The props declaration types the component: Boolean props are boolean, the others are optional. A component that requires a declared prop, mistypes one or needs an undeclared one is a compile error.',
    notes: 'Notes',
    notesItems: [
      'host is reserved for the element; declaring a prop named host throws.',
      'Avoid native property names such as title or hidden: the prop hides the native behavior.',
      'React 18 passes custom element props as attributes; set objects through a ref. React 19 and lithent assign them as properties.',
      'Inside the component, pass keyed lists as arrays, as everywhere in lithent.',
    ],
    stateRefLink: 'Share state across widgets with stateRef →',
  },
  ko: {
    title: '커스텀 엘리먼트 (lithent/element)',
    intro:
      'lithent/element는 lithent 컴포넌트를 표준 Custom Element로 등록합니다. 호스트 페이지는 lithent를 몰라도 됩니다. 스크립트와 태그를 넣고, 속성이나 프로퍼티를 설정하고, DOM 이벤트를 받으면 끝입니다. 그래서 결제 버튼, 상담·리뷰 위젯, 공통 헤더처럼 내가 소유하지 않은 페이지에 들어가는 UI에 맞습니다. 페이지가 순수 HTML이든 서버 렌더링 템플릿이든 React·Vue 앱이든 상관없습니다. 코어에 더해지는 크기는 1KB 미만(brotli)이고 빌드 단계가 필요 없습니다.',
    define: '엘리먼트 정의',
    defineText:
      'mount나 lmount 컴포넌트를 수정 없이 넘깁니다. props는 생성자로 선언하고, 각 prop은 kebab-case 속성으로 관찰되며 프로퍼티로도 노출됩니다.',
    use: '어떤 페이지에서든 사용',
    useText:
      'UMD 빌드를 쓰면 빌드 단계가 없습니다. 스크립트보다 먼저 HTML에 있던 태그도 업그레이드되고, 그 전에 넣어둔 프로퍼티 값도 이어받습니다.',
    demo: '직접 해보기',
    demoText:
      '아래 버튼이 엘리먼트입니다. 바깥 페이지는 amount를 설정하고 pay 이벤트를 받기만 합니다.',
    props: '속성과 프로퍼티',
    propsRows: [
      ['String', '속성 값 그대로', 'undefined'],
      ['Number', '숫자. 숫자가 아니면 undefined', 'undefined'],
      ['Boolean', '속성이 있으면 true ("false"도 true)', 'false'],
      ['Object', '값을 JSON.parse. 잘못된 JSON은 undefined', 'undefined'],
    ],
    propsHead: ['선언', '속성에서 읽은 값', '없을 때'],
    propsText:
      '프로퍼티는 변환 없이 어떤 값이든 받으므로 객체·배열·함수는 프로퍼티로 넘기세요. 프로퍼티는 속성으로 반영되지 않습니다. 같은 태스크 안의 여러 변경은 한 번만 렌더됩니다.',
    events: '엘리먼트 밖으로 이벤트 보내기',
    eventsText:
      '컴포넌트는 엘리먼트 자신을 props.host로 받습니다. emit은 그 위에서 bubbles·composed·cancelable인 CustomEvent를 발생시킵니다. 리스너가 preventDefault()를 호출하면 false를 반환하므로 "실행 전" 이벤트를 만들 수 있습니다.',
    styles: '스타일과 커스터마이즈',
    stylesText:
      '기본적으로 컴포넌트는 open shadow root에 렌더되므로 페이지 CSS가 안으로 들어오지 않고 위젯 CSS도 밖으로 새지 않습니다. 그래서 위젯이 자기 CSS를 가지고 들어갑니다. styles는 adopted style sheet 하나를 모든 인스턴스가 공유하고, 그 API가 없으면 <style>로 대체합니다. 호스트 페이지가 위젯을 테마링할 때는 shadow 경계를 통과하는 CSS 변수와 ::part()를 쓰세요.',
    options: '옵션',
    optionsRows: [
      ['props', 'prop 선언: { 이름: String | Number | Boolean | Object }'],
      [
        'shadow',
        "true / 'open' (기본), 'closed', 또는 false면 엘리먼트 자체에 렌더",
      ],
      ['styles', 'shadow root에 넣을 CSS 문자열 배열. shadow가 false면 무시'],
    ],
    slots: '자식과 slot',
    slotsText:
      'shadow 모드에서는 <slot>을 렌더하면 엘리먼트의 자식(이름 있는 slot 포함)이 보입니다. shadow: false면 엘리먼트가 자식을 소유합니다. 서버가 넣어둔 대체 콘텐츠처럼 안에 있던 것은 마운트할 때 교체됩니다.',
    lifecycle: '생명주기',
    lifecycleItems: [
      '엘리먼트를 붙이면 컴포넌트가 마운트되고, 떼면 microtask 뒤에 언마운트되며 mountCallback의 정리 함수가 실행됩니다.',
      '엘리먼트를 옮겨도(다른 곳에 appendChild, 또는 같은 태스크에서 remove() 후 삽입) 인스턴스와 상태가 유지됩니다.',
      'Custom Element가 없는 환경(SSR, Node)에서 defineElement는 예외 없이 undefined를 반환합니다. 이미 있는 이름이면 기존 생성자를 반환합니다.',
      '기본 코어와 concurrent 코어 모두에서 동작합니다.',
    ],
    types: 'TypeScript',
    typesText:
      'props 선언이 컴포넌트 타입을 정합니다. Boolean prop은 boolean, 나머지는 선택적입니다. 선언된 prop을 필수로 요구하거나, 타입이 다르거나, 선언하지 않은 prop을 요구하는 컴포넌트는 컴파일 오류입니다.',
    notes: '주의할 점',
    notesItems: [
      'host는 엘리먼트용 예약어입니다. host라는 prop을 선언하면 예외가 납니다.',
      'title, hidden 같은 네이티브 프로퍼티 이름은 피하세요. prop이 네이티브 동작을 가립니다.',
      'React 18은 커스텀 엘리먼트 prop을 속성으로 넘기므로 객체는 ref로 설정하세요. React 19와 lithent는 프로퍼티로 대입합니다.',
      '컴포넌트 안에서 keyed 리스트는 lithent 어디서나처럼 배열로 넘기세요.',
    ],
    stateRefLink: 'stateRef로 위젯 간 상태 공유 →',
  },
};

const table = (head: string[], rows: string[][]) => (
  <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
    <thead>
      <tr>
        {head.map(cell => (
          <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
            {cell}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr>
          {row.map(cell => (
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const ElementGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <h2>{t.define}</h2>
      <p>{t.defineText}</p>
      <CodeBlock
        language="tsx"
        code={`import { mount } from 'lithent';
import { defineElement, emit } from 'lithent/element';

const PayButton = mount<{ amount?: number; host: HTMLElement }>(
  (_renew, props) => () => (
    <button onClick={() => emit(props.host, 'pay', { amount: props.amount })}>
      Pay {props.amount}
    </button>
  )
);

defineElement('pay-button', PayButton, {
  props: { amount: Number },
  styles: ['button { background: var(--pay-color, #0064ff); color: white; }'],
});`}
      />

      <h2>{t.use}</h2>
      <p>{t.useText}</p>
      <CodeBlock
        language="html"
        code={`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/element/dist/lithentElement.umd.js"></script>
<script src="/pay-button.js"></script>  <!-- uses window.lithent, window.lithentElement -->

<pay-button amount="1000" style="--pay-color: #e91e63"></pay-button>
<script>
  const button = document.querySelector('pay-button');
  button.addEventListener('pay', e => console.log(e.detail));
  button.amount = 2000;
</script>`}
      />

      <h2>{t.demo}</h2>
      <p>{t.demoText}</p>
      <ElementDemo language={language} />

      <h2>{t.props}</h2>
      {table(t.propsHead, t.propsRows)}
      <p>{t.propsText}</p>
      <CodeBlock
        language="typescript"
        code={`defineElement('order-table', OrderTable, {
  props: { orderId: Number, compact: Boolean, filters: Object },
});

// <order-table order-id="42" compact filters='{"status":"open"}'></order-table>
const table = document.querySelector('order-table');
table.filters = { status: 'paid' }; // properties are not converted`}
      />

      <h2>{t.events}</h2>
      <p>{t.eventsText}</p>
      <CodeBlock
        language="typescript"
        code={`// inside the component
const allowed = emit(props.host, 'pay', { amount: props.amount });
if (!allowed) return; // the page called preventDefault()

// on the page
button.addEventListener('pay', e => {
  if (!confirm('Pay?')) e.preventDefault();
});`}
      />

      <h2>{t.styles}</h2>
      <p>{t.stylesText}</p>
      <CodeBlock
        language="css"
        code={`/* page CSS */
pay-button { --pay-color: #e91e63; }
pay-button::part(button) { border-radius: 999px; }`}
      />

      <h2>{t.options}</h2>
      {table(['', ''], t.optionsRows)}

      <h2>{t.slots}</h2>
      <p>{t.slotsText}</p>
      <CodeBlock
        language="tsx"
        code={`const Card = mount(() => () => (
  <section>
    <header><slot name="title" /></header>
    <slot />
  </section>
));
defineElement('info-card', Card);

// <info-card><b slot="title">Hello</b><p>Body</p></info-card>`}
      />

      <h2>{t.lifecycle}</h2>
      <ul>
        {t.lifecycleItems.map(text => (
          <li>{text}</li>
        ))}
      </ul>

      <h2>{t.types}</h2>
      <p>{t.typesText}</p>
      <CodeBlock
        language="typescript"
        code={`import type { ElementProps } from 'lithent/element';

const spec = { amount: Number, open: Boolean };
type Props = ElementProps<typeof spec>;
// { open: boolean } & { amount?: number } & { host: HTMLElement }

const Ctor = defineElement('my-panel', Panel, { props: spec });
const el = new Ctor!(); // el.amount: number | undefined, el.open: boolean`}
      />

      <h2>{t.notes}</h2>
      <ul>
        {t.notesItems.map(text => (
          <li>{text}</li>
        ))}
      </ul>

      <p>
        <a
          href="#/guide/state-ref"
          onClick={(event: Event) => {
            event.preventDefault();
            navigateTo('/guide/state-ref');
          }}
        >
          {t.stateRefLink}
        </a>
      </p>
    </div>
  );
};

export const Element = () => <ElementGuide language="en" />;
