import { CodeBlock } from '@/components/CodeBlock';
import { LivePlayground } from '@/components/LivePlayground';

const copy = {
  en: {
    title: 'Generative UI (lithent/live)',
    intro:
      'lithent/live runs widget code an LLM wrote, with no build step, in a sandboxed iframe, and connects the widget’s agentAction and agentState back to your page through the same bridge as lithent/agent. A model can create a small interactive UI, a person can use it, and on the next turn the model reads the state the person left and changes it, instead of generating the widget again. The host controller is about 4.5 KB (brotli) and the sandbox runtime about 8.5 KB.',
    play: 'Try it',
    playText:
      'The code below is the kind of widget a model would write. Run it, drag the slider as a person, then call its tools as the agent would: both sides read and change the same state. clear_expenses is marked confirm: true, so the page asks before it runs. “Try a broken version” shows the error and hint a model gets back.',
    host: 'On your page',
    hostText:
      'mountLive takes the generated code and a container. The sandbox runtime comes from lithent/live/runtime as a string, so no request is made; pass runtimeUrl instead to load sandboxRuntime.umd.js from a CDN. handle.bridge is the same AgentBridge as in lithent/agent: hand listTools() to your model and run its tool calls with callTool.',
    code: 'The code the model writes',
    codeText:
      'The code is the body of a function that returns a component. There is no build step, so it uses fTags or lTag instead of JSX and has no import or export. These names are in scope: mount, lmount, h, Fragment, ref, mountCallback, updateCallback, nextTick, state, lstate, computed, effect, store, lstore, fTags, fFragment, fMount, flMount, lTag, agentAction and agentState. Put this convention in your system prompt; the bundled agent skill (reference/live.md) has the same text.',
    errors: 'Errors the model can fix',
    errorsText:
      'When the code does not start, mountLive (or reload) rejects with a LiveError: the phase (compile, mount, render, timeout), the message and, for the usual mistakes, a hint. Send both back to the model and run the fixed code with reload or a new mountLive. Hints cover JSX, import and export, a missing return, React habits such as useState, calling render yourself, unknown names and timeouts.',
    safety: 'What the sandbox allows',
    safetyItems: [
      'The iframe has sandbox="allow-scripts" and nothing else: the widget gets an opaque origin, so it cannot reach your DOM, cookies or storage.',
      'A CSP blocks every network request from the widget. allowNetwork: true lifts it when the widget really needs the network.',
      'Without runtimeCode or runtimeUrl, mountLive fails at once and loads nothing: no hidden CDN request.',
      'Actions marked confirm: true ask your page’s confirm handler before the call reaches the sandbox.',
      'Messages carry a per-session channel id and are accepted only from the iframe they belong to.',
      "The sandbox document inherits your page’s CSP: a policy that blocks 'unsafe-eval' or inline scripts also stops the widget.",
    ],
    tag: 'One tag in any framework',
    tagText:
      'defineLiveElement() registers <lithent-live>. It needs no lithent core to show sandboxed widgets, so React, Vue or plain pages can use it as is. Set code as an attribute or property, runtimeCode or runtime-url, props, theme and styles; listen to live-ready (detail.bridge) and live-error.',
    layout: 'Fitting into the page',
    layoutText:
      'autoResize (on by default) sizes the iframe to the widget’s content, so there is no second scrollbar. theme passes CSS custom properties the widget can use (var(--brand)); styles adds CSS. updateProps sends new props and keeps the widget’s own state.',
    direct: 'Trusted code: direct mode',
    directText:
      "mode: 'direct' runs the code in your page, in a shadow root, with your page’s lithent, and needs no sandbox runtime. The bridge, approvals and errors work the same. Use it only for code you trust; it warns once.",
  },
  ko: {
    title: '생성형 UI (lithent/live)',
    intro:
      'lithent/live는 LLM이 작성한 위젯 코드를 빌드 없이 샌드박스 iframe에서 실행하고, 위젯의 agentAction과 agentState를 lithent/agent와 같은 브릿지로 페이지에 연결합니다. 모델이 작은 인터랙티브 UI를 만들고, 사람이 그것을 조작한 뒤, 다음 대화에서 모델이 위젯을 다시 만들지 않고 사람이 남긴 상태를 읽어 바꿀 수 있습니다. 호스트 컨트롤러는 약 4.5 KB(brotli), 샌드박스 런타임은 약 8.5 KB입니다.',
    play: '직접 해 보기',
    playText:
      '아래 코드는 모델이 작성할 법한 위젯입니다. 실행한 뒤 사람으로서 슬라이더를 움직이고, 에이전트처럼 도구를 호출해 보세요. 양쪽이 같은 상태를 읽고 바꿉니다. clear_expenses는 confirm: true라서 실행 전에 페이지가 확인을 받습니다. "망가진 버전 넣어 보기"는 모델이 돌려받는 오류와 힌트를 보여 줍니다.',
    host: '페이지 쪽 코드',
    hostText:
      'mountLive는 생성된 코드와 컨테이너를 받습니다. 샌드박스 런타임은 lithent/live/runtime에서 문자열로 가져오므로 요청이 생기지 않습니다. CDN에서 sandboxRuntime.umd.js를 불러오려면 대신 runtimeUrl을 넘기세요. handle.bridge는 lithent/agent와 같은 AgentBridge입니다. listTools()를 모델에 넘기고, 모델의 도구 호출은 callTool로 실행합니다.',
    code: '모델이 작성하는 코드',
    codeText:
      '코드는 컴포넌트를 반환하는 함수 본문입니다. 빌드 단계가 없으므로 JSX 대신 fTags나 lTag를 쓰고, import와 export도 쓰지 않습니다. 쓸 수 있는 이름: mount, lmount, h, Fragment, ref, mountCallback, updateCallback, nextTick, state, lstate, computed, effect, store, lstore, fTags, fFragment, fMount, flMount, lTag, agentAction, agentState. 이 규약을 시스템 프롬프트에 넣으세요. 번들된 에이전트 스킬(reference/live.md)에도 같은 내용이 있습니다.',
    errors: '모델이 고칠 수 있는 오류',
    errorsText:
      '코드가 시작하지 못하면 mountLive(또는 reload)가 LiveError로 reject합니다. 단계(compile, mount, render, timeout), 메시지, 그리고 흔한 실수에는 힌트가 들어 있습니다. 둘을 모델에 돌려주고, 고친 코드를 reload나 새 mountLive로 실행하세요. 힌트는 JSX, import·export, return 누락, useState 같은 React 습관, render 직접 호출, 없는 이름, 타임아웃을 다룹니다.',
    safety: '샌드박스가 허용하는 것',
    safetyItems: [
      'iframe에는 sandbox="allow-scripts"만 있습니다. 위젯은 opaque origin을 받아 페이지의 DOM, 쿠키, 저장소에 접근할 수 없습니다.',
      'CSP가 위젯의 모든 네트워크 요청을 막습니다. 정말 필요할 때만 allowNetwork: true로 풉니다.',
      'runtimeCode나 runtimeUrl이 없으면 mountLive는 바로 실패하고 아무것도 불러오지 않습니다. 숨은 CDN 요청은 없습니다.',
      'confirm: true인 액션은 호출이 샌드박스에 닿기 전에 페이지의 승인 핸들러를 거칩니다.',
      '메시지는 세션마다 다른 채널 id를 갖고, 해당 iframe에서 온 것만 받아들입니다.',
      "샌드박스 문서는 페이지의 CSP를 물려받습니다. 'unsafe-eval'이나 인라인 스크립트를 막는 정책이면 위젯도 시작하지 못합니다.",
    ],
    tag: '어느 프레임워크에서나 태그 하나로',
    tagText:
      'defineLiveElement()가 <lithent-live>를 등록합니다. 샌드박스 위젯만 띄울 때는 lithent 코어가 필요 없어서 React, Vue, 일반 페이지에서 그대로 쓸 수 있습니다. code는 속성이나 프로퍼티로, runtimeCode나 runtime-url, props, theme, styles를 설정하고 live-ready(detail.bridge)와 live-error를 들으세요.',
    layout: '페이지에 맞추기',
    layoutText:
      'autoResize(기본 켜짐)가 iframe 높이를 위젯 내용에 맞춰 이중 스크롤바가 생기지 않습니다. theme은 위젯이 쓸 CSS 사용자 정의 속성(var(--brand))을, styles는 CSS를 넘깁니다. updateProps는 새 props를 보내면서 위젯 자체 상태를 유지합니다.',
    direct: '신뢰한 코드: Direct 모드',
    directText:
      "mode: 'direct'는 코드를 페이지 안의 Shadow Root에서 페이지의 lithent로 실행하며 샌드박스 런타임이 필요 없습니다. 브릿지, 승인, 오류는 같게 동작합니다. 신뢰하는 코드에만 쓰세요. 처음 쓸 때 한 번 경고합니다.",
  },
};

export const LiveGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <h2>{t.play}</h2>
      <p>{t.playText}</p>
      <LivePlayground language={language} />

      <h2>{t.host}</h2>
      <p>{t.hostText}</p>
      <CodeBlock
        language="typescript"
        code={`import { mountLive } from 'lithent/live';
import { sandboxRuntimeCode } from 'lithent/live/runtime';

const handle = await mountLive({
  code,                               // from the model
  container: document.getElementById('widget'),
  runtimeCode: sandboxRuntimeCode,    // or runtimeUrl
  props: { currency: 'KRW' },
  theme: { '--brand': '#0064ff' },
  onError: error => sendToModel(error), // { phase, message, hint? }
});

handle.bridge.setConfirmHandler(({ name, args }) => askUser(name, args));
const tools = handle.bridge.listTools();        // give these to the model
const result = await handle.bridge.callTool('set_budget', { amount: 800 });
const state = handle.bridge.getState();         // what the person left

await handle.updateProps({ currency: 'USD' });  // keeps the widget's state
await handle.reload(fixedCode);                 // fresh sandbox, same bridge
handle.destroy();`}
      />

      <h2>{t.code}</h2>
      <p>{t.codeText}</p>
      <CodeBlock
        language="javascript"
        code={`return lmount(props => {
  const count = lstate(props.start || 0);
  const { div, button, p } = fTags;

  agentAction({
    name: 'add',
    description: 'Add to the counter',
    params: { by: { type: Number, required: true } },
    run: ({ by }) => { count.value += by; return count.value; },
  });
  agentState('counter', () => ({ count: count.value }));

  return () =>
    div({},
      p({}, 'Count: ' + count.value),
      button({ onClick: () => count.value++ }, '+1'));
});`}
      />

      <h2>{t.errors}</h2>
      <p>{t.errorsText}</p>
      <CodeBlock
        language="typescript"
        code={`try {
  handle = await mountLive({ code, container, runtimeCode: sandboxRuntimeCode });
} catch (error) {
  // { phase: 'compile', message: "Unexpected token '<'",
  //   hint: 'JSX is not available in build-less widget code: use fTags ...' }
  code = await model.fix(code, error.message, error.hint);
}`}
      />

      <h2>{t.safety}</h2>
      <ul>
        {t.safetyItems.map(item => (
          <li>{item}</li>
        ))}
      </ul>

      <h2>{t.tag}</h2>
      <p>{t.tagText}</p>
      <CodeBlock
        language="html"
        code={`<lithent-live id="widget"></lithent-live>
<script type="module">
  import { defineLiveElement } from 'lithent/live';
  import { sandboxRuntimeCode } from 'lithent/live/runtime';

  defineLiveElement();
  const el = document.getElementById('widget');
  el.runtimeCode = sandboxRuntimeCode;
  el.props = { start: 1 };
  el.code = generatedCode;
  el.addEventListener('live-ready', e => agent.useTools(e.detail.bridge));
  el.addEventListener('live-error', e => agent.retry(e.detail));
</script>`}
      />

      <h2>{t.layout}</h2>
      <p>{t.layoutText}</p>

      <h2>{t.direct}</h2>
      <p>{t.directText}</p>
    </div>
  );
};

export const Live = () => <LiveGuide language="en" />;
