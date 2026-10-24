// DC-21: one flat table and one shared proxy, without per-event slots/arrays.
const eventHandlers = Symbol();
type Handler = EventListenerOrEventListenerObject;
type EventElement = HTMLElement & {
  [eventHandlers]?: Record<string, Handler | true | undefined>;
};

function dispatch(this: EventElement, event: Event) {
  const handler = this[eventHandlers]?.['on' + event.type];
  if (typeof handler === 'function') {
    handler.call(this, event);
  } else if (handler && handler !== true) {
    handler.handleEvent(event);
  }
}

export const removeEvent = (
  element: EventElement,
  eventKey: string,
  handler: Handler
) => {
  const name = eventKey.slice(2).toLowerCase();
  const key = 'on' + name;
  const events = element[eventHandlers];
  if (events && events[key] === handler) {
    delete events[key];
    element.removeEventListener(name, dispatch);
  } else {
    // Shared teardown also serves concurrent's direct native registrations.
    element.removeEventListener(name, handler);
  }
};

export const updateEvent = (
  element: EventElement,
  eventKey: string,
  newHandler: Handler | undefined,
  oldHandler?: Handler
) => {
  if (oldHandler === newHandler) return;
  const name = eventKey.slice(2).toLowerCase();
  const key = 'on' + name;
  const events = (element[eventHandlers] ||= {});
  const current = events[key];
  if (current === true) {
    if (oldHandler) element.removeEventListener(name, oldHandler);
    if (newHandler) element.addEventListener(name, newHandler);
  } else if (newHandler) {
    if (current && current !== oldHandler && current !== newHandler) {
      // Distinct aliases need native ordering and stopImmediatePropagation.
      element.removeEventListener(name, dispatch);
      element.addEventListener(name, current);
      element.addEventListener(name, newHandler);
      events[key] = true;
    } else {
      events[key] = newHandler;
      if (!current) element.addEventListener(name, dispatch);
    }
  } else if (current && current === oldHandler) {
    delete events[key];
    element.removeEventListener(name, dispatch);
  }
};
