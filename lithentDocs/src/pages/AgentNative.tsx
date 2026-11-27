import { CodeBlock } from '@/components/CodeBlock';

const copy = {
  en: {
    title: 'Agent-Native Components (lithent/agent)',
    intro:
      'lithent/agent lets an AI agent operate your UI the way a person does. A component declares its actions and its state once. A person triggers the actions from buttons and inputs; an agent (an in-app copilot, a test, the browser’s WebMCP) calls the same actions and reads the same closure state through a bridge, without scraping the DOM. It adds about 2.3 KB (brotli) and works with mount and lmount, on the base and the concurrent core.',
    why: 'Why it fits lithent',
    whyText:
      'A lithent mounter runs once per instance. An action declared there closes over the instance’s live state, so there are no dependency arrays to keep in sync and no stale closures: the function the button calls is the function the agent calls. Registration follows the component’s lifecycle, so an agent only ever sees the tools of what is on screen.',
    declare: 'Declare actions and state',
    declareText:
      'Call agentAction and agentState in the mounter. Parameters are declared with constructors, like lithent/element props, and become a JSON Schema the agent receives. The function agentAction returns is your UI handler.',
    drive: 'Drive it from an agent',
    driveText:
      'Render the components under an <AgentScope> with a bridge. listTools() gives JSON Schema tools you can pass to OpenAI, Anthropic, Gemini or an MCP server; callTool runs one; getState() returns every declared state as JSON; subscribe tells you when tools or state change.',
    results: 'Results and errors',
    resultsText:
      'callTool never throws. It resolves with { ok: true, value } or { ok: false, error: { code, message, details? } }, so you can hand the result straight back to the model and let it correct itself.',
    resultsHead: ['code', 'When'],
    resultsRows: [
      ['NOT_FOUND', 'No mounted action has that name (or it unmounted).'],
      [
        'INVALID_PARAMS',
        'A required argument is missing, has the wrong type or is not in enum. details lists every problem.',
      ],
      ['REJECTED', 'The action needs confirmation and it was not given.'],
      ['EXECUTION_ERROR', 'run threw or its promise rejected.'],
    ],
    resultsNote:
      'Keys the declaration does not name are dropped before run. Calls of the returned function from your own UI skip these checks: they run at once.',
    state: 'State and change events',
    stateText:
      'A getter returns JSON-safe data. Subscribers hear about a change after the component updates, whether a person typed into a plain input or an action ran, and at most once per microtask. A getter that throws or returns a cycle shows up as { __agentStateError } instead of breaking the whole snapshot.',
    scopes: 'Scopes and names',
    scopesText:
      'Each declaration uses options.bridge, else the nearest <AgentScope>, else defaultAgentBridge, decided when the component mounts. Several instances of one component can share a bridge with scopeId: names join as scope__name. Keep names to letters, digits, _ and -, because OpenAI and Anthropic reject other characters such as the dot. A second registration of a taken name warns and the newest instance wins; createAgentBridge({ onConflict: "error" }) throws instead.',
    confirm: 'Confirmation for sensitive actions',
    confirmText:
      'Mark an action confirm: true and give the bridge a handler. Only agent calls ask: a person pressing the button is not asked twice. No handler, an error, or any answer other than true returns REJECTED, so a marked action never runs unapproved.',
    webmcp: 'WebMCP',
    webmcpText:
      'connectWebMCP(bridge) mirrors the bridge’s tools into the browser’s WebMCP context (document.modelContext, or navigator.modelContext in earlier drafts) and follows mounts and unmounts. It is opt-in, does nothing where WebMCP is missing or on the server, and bundlers drop it when you do not import it.',
    elements: 'Inside Custom Elements',
    elementsText:
      'An element made with lithent/element renders its own tree, so an <AgentScope> outside the element does not reach inside. Hand the page’s bridge over as an Object prop and wrap the inner tree.',
    notes: 'Notes',
    notesItems: [
      'Declare in the mounter. A declaration in the updater warns and is not registered again.',
      'renderToString registers nothing: mount callbacks do not run on the server.',
      'useAgentBridge() returns the component’s bridge; call its methods after mount, in mountCallback or handlers. You can also pass it to children or to a Custom Element prop.',
      'Generated UI (LLM-written widgets in a sandbox) is the next step: lithent/live, which exposes the same bridge contract.',
    ],
  },
  ko: {
    title: 'Agent-Native 컴포넌트 (lithent/agent)',
    intro:
      'lithent/agent는 AI 에이전트가 사람과 같은 방식으로 UI를 조작하게 해 줍니다. 컴포넌트는 액션과 상태를 한 번만 선언합니다. 사람은 버튼과 입력으로 액션을 실행하고, 에이전트(앱 안의 코파일럿, 테스트, 브라우저 WebMCP)는 브릿지를 통해 같은 액션을 호출하고 같은 클로저 상태를 읽습니다. DOM을 긁어 올 필요가 없습니다. 크기는 약 2.3 KB(brotli)이며 mount·lmount, base·concurrent 코어 모두에서 동작합니다.',
    why: '왜 lithent에 잘 맞나',
    whyText:
      'lithent의 mounter는 인스턴스마다 한 번만 실행됩니다. 여기서 선언한 액션은 인스턴스의 살아 있는 상태를 그대로 캡처하므로, 의존성 배열을 맞출 필요도 없고 stale closure도 생기지 않습니다. 버튼이 부르는 함수와 에이전트가 부르는 함수가 같은 함수입니다. 등록은 컴포넌트 수명을 따라가므로 에이전트에게는 화면에 있는 것의 도구만 보입니다.',
    declare: '액션과 상태 선언',
    declareText:
      'agentAction과 agentState는 mounter에서 호출합니다. 파라미터는 lithent/element의 props처럼 생성자로 선언하며, 에이전트가 받는 JSON Schema로 변환됩니다. agentAction이 반환한 함수는 그대로 UI 핸들러로 씁니다.',
    drive: '에이전트에서 조작하기',
    driveText:
      '컴포넌트를 브릿지를 가진 <AgentScope> 아래에 렌더링합니다. listTools()는 OpenAI, Anthropic, Gemini, MCP 서버에 그대로 넘길 수 있는 JSON Schema 도구 목록을 주고, callTool은 도구를 실행하며, getState()는 선언된 모든 상태를 JSON으로 돌려주고, subscribe는 도구나 상태가 바뀔 때 알려 줍니다.',
    results: '결과와 오류',
    resultsText:
      'callTool은 예외를 던지지 않습니다. { ok: true, value } 또는 { ok: false, error: { code, message, details? } }로 resolve되므로, 결과를 그대로 모델에 돌려주면 모델이 스스로 고쳐서 다시 호출할 수 있습니다.',
    resultsHead: ['code', '언제'],
    resultsRows: [
      ['NOT_FOUND', '그 이름의 액션이 마운트되어 있지 않을 때 (언마운트 포함)'],
      [
        'INVALID_PARAMS',
        '필수 인자가 없거나 타입이 틀리거나 enum에 없을 때. details에 문제가 모두 담깁니다.',
      ],
      ['REJECTED', '승인이 필요한 액션인데 승인되지 않았을 때'],
      ['EXECUTION_ERROR', 'run이 예외를 던지거나 Promise가 거부됐을 때'],
    ],
    resultsNote:
      '선언에 없는 키는 run에 넘기기 전에 버립니다. 반환된 함수를 내 UI에서 직접 호출하면 이 검사를 거치지 않고 바로 실행됩니다.',
    state: '상태와 변경 이벤트',
    stateText:
      'getter는 JSON으로 표현할 수 있는 값을 반환합니다. 사람이 일반 input에 입력했든 액션이 실행됐든, 컴포넌트가 업데이트된 뒤 구독자에게 변경을 알리며 마이크로태스크당 최대 한 번입니다. getter가 예외를 던지거나 순환 참조를 반환하면 전체 스냅샷을 깨뜨리지 않고 그 키만 { __agentStateError }가 됩니다.',
    scopes: '스코프와 이름',
    scopesText:
      '각 선언은 options.bridge, 없으면 가장 가까운 <AgentScope>, 그것도 없으면 defaultAgentBridge를 쓰며, 컴포넌트가 마운트될 때 정해집니다. 같은 컴포넌트의 여러 인스턴스가 한 브릿지를 쓸 때는 scopeId로 이름을 나눕니다. 이름은 scope__name 형태로 합쳐집니다. OpenAI와 Anthropic은 점(.) 같은 다른 문자를 거절하므로 이름에는 영문자, 숫자, _, -만 쓰세요. 이미 있는 이름을 다시 등록하면 경고 후 가장 최근 인스턴스가 이깁니다. createAgentBridge({ onConflict: "error" })로 하면 예외를 던집니다.',
    confirm: '민감한 액션의 승인',
    confirmText:
      '액션에 confirm: true를 주고 브릿지에 핸들러를 설정합니다. 에이전트 호출만 승인을 묻고, 사람이 버튼을 누를 때는 다시 묻지 않습니다. 핸들러가 없거나 예외가 나거나 true가 아닌 답이면 REJECTED이므로, 표시된 액션은 승인 없이 실행되지 않습니다.',
    webmcp: 'WebMCP',
    webmcpText:
      'connectWebMCP(bridge)는 브릿지의 도구를 브라우저 WebMCP 컨텍스트(document.modelContext, 이전 초안은 navigator.modelContext)에 등록하고 마운트·언마운트를 따라갑니다. 명시적으로 켜야 하고, WebMCP가 없거나 서버에서는 아무것도 하지 않으며, import하지 않으면 번들러가 제거합니다.',
    elements: 'Custom Element 안에서',
    elementsText:
      'lithent/element로 만든 엘리먼트는 자기 트리를 따로 렌더링하므로, 엘리먼트 바깥의 <AgentScope>는 안쪽에 닿지 않습니다. 페이지의 브릿지를 Object prop으로 넘기고 안쪽 트리를 감싸세요.',
    notes: '참고',
    notesItems: [
      'mounter에서 선언하세요. updater에서 선언하면 경고가 나고 다시 등록되지 않습니다.',
      'renderToString은 아무것도 등록하지 않습니다. 서버에서는 mount 콜백이 실행되지 않습니다.',
      'useAgentBridge()는 컴포넌트의 브릿지를 반환합니다. 메서드는 마운트 이후(mountCallback이나 핸들러)에 호출하세요. 자식 컴포넌트나 Custom Element prop으로 넘겨도 됩니다.',
      '생성형 UI(샌드박스에서 실행하는 LLM 작성 위젯)는 다음 단계인 lithent/live에서 같은 브릿지 계약으로 제공됩니다.',
    ],
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

export const AgentNativeGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <h2>{t.why}</h2>
      <p>{t.whyText}</p>

      <h2>{t.declare}</h2>
      <p>{t.declareText}</p>
      <CodeBlock
        language="tsx"
        code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';
import { agentAction, agentState } from 'lithent/agent';

const OrderList = lmount(() => {
  const status = lstate<'all' | 'delayed' | 'done'>('all');
  const minPrice = lstate(0);

  const filter = agentAction({
    name: 'filter_orders',
    description: 'Filter orders by delivery status and minimum price',
    params: {
      status: { type: String, enum: ['all', 'delayed', 'done'], required: true },
      minPrice: { type: Number, description: 'Minimum price' },
    },
    run: ({ status: next, minPrice: min = 0 }) => {
      status.value = next as 'all' | 'delayed' | 'done';
      minPrice.value = min;
      return { status: status.value, minPrice: minPrice.value };
    },
  });

  agentState('order_filter', () => ({
    status: status.value,
    minPrice: minPrice.value,
  }));

  return () => (
    <button onClick={() => filter({ status: 'delayed' })}>Delayed only</button>
  );
});`}
      />

      <h2>{t.drive}</h2>
      <p>{t.driveText}</p>
      <CodeBlock
        language="tsx"
        code={`import { render } from 'lithent';
import { AgentScope, createAgentBridge } from 'lithent/agent';

const bridge = createAgentBridge();
render(
  <AgentScope bridge={bridge}>
    <OrderList />
  </AgentScope>,
  document.getElementById('root')
);

bridge.listTools();
// [{ name: 'filter_orders', description: '...', inputSchema: {
//    type: 'object',
//    properties: { status: { type: 'string', enum: [...] }, minPrice: { type: 'number', ... } },
//    required: ['status'], additionalProperties: false } }]

await bridge.callTool('filter_orders', { status: 'done', minPrice: 5000 });
// { ok: true, value: { status: 'done', minPrice: 5000 } }

bridge.getState(); // { order_filter: { status: 'done', minPrice: 5000 } }

const stop = bridge.subscribe(event => {
  // { type: 'tools-changed', tools } or { type: 'state-changed', name?, state }
});`}
      />

      <h2>{t.results}</h2>
      <p>{t.resultsText}</p>
      {table(t.resultsHead, t.resultsRows)}
      <p>{t.resultsNote}</p>
      <CodeBlock
        language="typescript"
        code={`await bridge.callTool('filter_orders', { minPrice: 'cheap' });
// { ok: false, error: {
//     code: 'INVALID_PARAMS',
//     message: 'Invalid arguments for "filter_orders": status (required), minPrice (type).',
//     details: [
//       { param: 'status', issue: 'required' },
//       { param: 'minPrice', issue: 'type', expected: 'number' },
//     ] } }`}
      />

      <h2>{t.state}</h2>
      <p>{t.stateText}</p>

      <h2>{t.scopes}</h2>
      <p>{t.scopesText}</p>
      <CodeBlock
        language="tsx"
        code={`const CartItem = mount<{ id: string }>((_renew, props) => {
  agentAction({
    name: 'remove_item',
    description: 'Remove this item from the cart',
    scopeId: props.id,            // registered as '<id>__remove_item'
    run: () => removeItem(props.id),
  });
  return () => <li>{props.id}</li>;
});

const bridge = createAgentBridge({ onConflict: 'error' });`}
      />

      <h2>{t.confirm}</h2>
      <p>{t.confirmText}</p>
      <CodeBlock
        language="tsx"
        code={`agentAction({
  name: 'delete_order',
  description: 'Delete an order',
  params: { id: { type: String, required: true } },
  confirm: true,                  // or confirm: ctx => boolean | Promise<boolean>
  run: ({ id }) => deleteOrder(id),
});

bridge.setConfirmHandler(async ({ name, description, args }) =>
  openConfirmDialog(\`\${description}: \${JSON.stringify(args)}\`)
);`}
      />

      <h2>{t.webmcp}</h2>
      <p>{t.webmcpText}</p>
      <CodeBlock
        language="typescript"
        code={`import { connectWebMCP } from 'lithent/agent';

const disconnect = connectWebMCP(bridge);
// each tool's execute(args) returns the callTool result
disconnect(); // removes every tool it registered`}
      />

      <h2>{t.elements}</h2>
      <p>{t.elementsText}</p>
      <CodeBlock
        language="tsx"
        code={`import { defineElement } from 'lithent/element';
import { AgentScope } from 'lithent/agent';
import type { AgentBridge } from 'lithent/agent';

const Panel = mount<{ host: HTMLElement; bridge?: unknown }>((_renew, props) =>
  () => (
    <AgentScope bridge={props.bridge as AgentBridge}>
      <OrderList />
    </AgentScope>
  )
);
defineElement('order-panel', Panel, { props: { bridge: Object } });

document.querySelector('order-panel').bridge = bridge;`}
      />

      <h2>{t.notes}</h2>
      <ul>
        {t.notesItems.map(item => (
          <li>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export const AgentNative = () => <AgentNativeGuide language="en" />;
