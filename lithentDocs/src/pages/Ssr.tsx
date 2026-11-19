import { CodeBlock } from '@/components/CodeBlock';

const en = {
  title: 'Server Rendering (lithent/ssr)',
  intro:
    'lithent/ssr renders a Lithent component to an HTML string on the server, then attaches it to that existing markup in the browser instead of rebuilding the page. Server-side rendering (SSR) means the server sends finished HTML, so the page shows up immediately. Hydration means the browser then connects click handlers and component state to that HTML, rather than creating it all again. It is part of the existing lithent/ssr entry and needs the Lithent core as a peer dependency.',
  render: 'Render on the server, hydrate in the browser',
  renderText:
    'Both sides render the same root component. The root renders the whole document, so the browser hydrates document.documentElement.',
  mismatch: 'If the server and browser output differ',
  mismatchText:
    'Hydrate with the same component and props the server used, so the DOM that hydration walks matches the markup the server sent. If they differ, hydration creates the elements the server HTML lacks in the browser and logs a console.warn for each one. Server nodes the component does not render, such as a loader script, are left in place.',
  api: 'API',
  apiHead: ['API', 'Contract'],
  apiRows: [
    [
      'renderToString(wDom)',
      'Returns the HTML string for a WDom built with h. Event props, ref and key are left out of the output.',
    ],
    [
      'hydration(wDom, wrapElement)',
      'Attaches events and component state to the existing DOM inside wrapElement and returns the result of render.',
    ],
    [
      'renderWithHydration(tagFunction)',
      'One entry for both sides: hydrates document.documentElement in a browser, returns a string on the server.',
    ],
  ],
  apiText:
    'renderWithHydration takes a component and renders it with empty props, so use renderToString and hydration when the page needs props.',
  escaping: 'Escaping',
  escapingText:
    'Text and attribute values are escaped. innerHTML is written as is, so pass only trusted HTML.',
  full: 'Full example',
  fullText:
    'createLithent/express is a complete setup: serverHelper/makePage.js calls renderToString on the server and src/base/load.ts calls hydration in the browser. Scaffold it with npx create-lithent@latest.',
};

const copy = {
  en,
  // English placeholder: the maintainer translates this in review.
  ko: { ...en },
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

export const SsrGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <CodeBlock
        language="typescript"
        code={`import { renderToString, hydration, renderWithHydration } from 'lithent/ssr';`}
      />

      <h2>{t.render}</h2>
      <p>{t.renderText}</p>
      <CodeBlock
        language="tsx"
        code={`// App.tsx — shared by the server and the browser
import { mount } from 'lithent';

export const App = mount<{ title: string }>((renew, props) => {
  let count = 0;

  return () => (
    <html>
      <head>
        <title>{props.title}</title>
      </head>
      <body>
        <button
          onClick={() => {
            count += 1;
            renew();
          }}
        >
          Clicked {count}
        </button>
      </body>
    </html>
  );
});`}
      />
      <CodeBlock
        language="tsx"
        code={`// server.tsx — returns a string; event handlers are not written to the markup
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import { App } from './App';

export const page = () =>
  \`<!doctype html>\${renderToString(h(App, { title: 'Hello' }))}\`;`}
      />
      <CodeBlock
        language="tsx"
        code={`// client.tsx — reuses the server markup and attaches the event handlers
import { h } from 'lithent';
import { hydration } from 'lithent/ssr';
import { App } from './App';

hydration(h(App, { title: 'Hello' }), document.documentElement);`}
      />

      <h2>{t.mismatch}</h2>
      <p>{t.mismatchText}</p>

      <h2>{t.api}</h2>
      {table(t.apiHead, t.apiRows)}
      <p>{t.apiText}</p>
      <CodeBlock
        language="tsx"
        code={`import { renderWithHydration } from 'lithent/ssr';
import { Page } from './Page';

// Browser: hydrates the current document.
// Server: returns the HTML string.
const html = renderWithHydration(Page);`}
      />

      <h2>{t.escaping}</h2>
      <p>{t.escapingText}</p>

      <h2>{t.full}</h2>
      <p>{t.fullText}</p>
    </div>
  );
};

export const Ssr = () => <SsrGuide language="en" />;
