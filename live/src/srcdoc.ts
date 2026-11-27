import type { LiveBootConfig } from '@/types';

/**
 * The sandbox document (docs/agent-ui/DESIGN.md §3.3, DC-7, DC-13).
 */

/** Keep text inside a <script> element from closing or commenting it. */
const scriptText = (code: string) =>
  code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

/** JSON that is safe inside a <script> element: no `<` at all. */
const scriptJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

const attribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * DC-7: nothing leaves the sandbox. Scripts are inline (plus the runtime's
 * origin when it is loaded by URL); `'unsafe-eval'` runs the generated code.
 */
export const sandboxCsp = (runtimeUrl?: string) =>
  `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'${
    runtimeUrl ? ' ' + new URL(runtimeUrl, location.href).origin : ''
  }; style-src 'unsafe-inline'`;

export type SrcdocOptions = {
  config: LiveBootConfig;
  styles?: string[];
  runtimeCode?: string;
  runtimeUrl?: string;
  allowNetwork?: boolean;
};

export const buildSrcdoc = ({
  config,
  styles = [],
  runtimeCode,
  runtimeUrl,
  allowNetwork,
}: SrcdocOptions) => {
  const csp = allowNetwork
    ? ''
    : `<meta http-equiv="Content-Security-Policy" content="${attribute(
        sandboxCsp(runtimeCode == null ? runtimeUrl : undefined)
      )}">`;
  const css = ['html,body{margin:0}', ...styles]
    .map(text => `<style>${text.replace(/<\/style/gi, '<\\/style')}</style>`)
    .join('');
  const runtime =
    runtimeCode != null
      ? `<script>${scriptText(runtimeCode)}</script>`
      : `<script src="${attribute(runtimeUrl as string)}"></script>`;
  // If the runtime did not load (bad URL, blocked), say so at once instead
  // of letting the host wait for its timeout.
  const start = `<script>var r=window.lithentLiveRuntime,c=${scriptJson(
    config
  )};r?r.start(c):parent.postMessage({ch:c.ch,type:"error",error:{phase:"compile",message:"The sandbox runtime did not load."}},c.origin&&c.origin!="null"?c.origin:"*")</script>`;

  return `<!doctype html><html><head><meta charset="utf-8">${csp}${css}</head><body><div id="root"></div>${runtime}${start}</body></html>`;
};
