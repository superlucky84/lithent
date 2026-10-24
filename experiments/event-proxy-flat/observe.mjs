import { updateEvent } from './event-helper.mjs';
export function observe() {
  const results = {};
  {
    const el = document.createElement('button');
    const calls = [];
    const a = () => calls.push('old');
    const b = () => calls.push('new');
    updateEvent(el, 'onClick', a);
    el.addEventListener('click', () => calls.push('external'));
    updateEvent(el, 'onClick', b, a);
    el.click();
    results.externalOrder = calls;
  }
  {
    const el = document.createElement('button');
    let calls = 0;
    const handler = () => calls++;
    updateEvent(el, 'onClick', handler);
    el.removeEventListener('click', handler);
    el.click();
    results.externalRemove = calls;
  }
  {
    const el = document.createElement('button');
    let calls = 0;
    const handler = () => calls++;
    el.addEventListener('click', handler);
    updateEvent(el, 'onClick', handler);
    el.click();
    results.externalDedup = calls;
  }
  {
    const el = document.createElement('button');
    const calls = [];
    const old = () => calls.push('old');
    const next = () => calls.push('new');
    el.addEventListener('click', () => updateEvent(el, 'onClick', next, old), {
      once: true,
    });
    updateEvent(el, 'onClick', old);
    el.click();
    results.sameDispatchReplacement = calls.slice();
    el.click();
    results.nextDispatchReplacement = calls.slice();
  }
  {
    const el = document.createElement('button');
    const calls = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    const c = () => calls.push('c');
    updateEvent(el, 'onClick', a);
    updateEvent(el, 'onclick', b);
    updateEvent(el, 'onClick', c, a);
    el.click();
    results.aliasReplacementOrder = calls;
  }
  {
    const el = document.createElement('button');
    const calls = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    updateEvent(el, 'onClick', a);
    updateEvent(el, 'onclick', a);
    el.click();
    updateEvent(el, 'onClick', b, a);
    el.click();
    results.aliasDedup = calls;
  }
  return results;
}
