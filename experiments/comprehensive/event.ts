// DC-22 candidate: keep the original proxy alive across rare alias transitions.
const eventHandlers = Symbol();
const nativeAliases = Symbol();
type Handler = EventListenerOrEventListenerObject;
type EventTable = Record<string, Handler | undefined> & {
  [nativeAliases]?: Set<string>;
};
type EventElement = EventTarget & { [eventHandlers]?: EventTable };

function dispatch(this: EventElement, event: Event) {
  const handler = this[eventHandlers]?.['on' + event.type];
  if (typeof handler === 'function') handler.call(this, event);
  else if (handler) handler.handleEvent(event);
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
  } else element.removeEventListener(name, handler);
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
  if (events[nativeAliases]?.has(key)) {
    if (oldHandler) removeEvent(element, eventKey, oldHandler);
    // A retained proxy represents the same native registration identity.
    if (newHandler && newHandler !== events[key])
      element.addEventListener(name, newHandler);
  } else if (newHandler) {
    if (current && current !== oldHandler && current !== newHandler) {
      (events[nativeAliases] ||= new Set()).add(key);
      // Removing/readding current would lose it from an active dispatch.
      element.addEventListener(name, newHandler);
    } else {
      events[key] = newHandler;
      if (!current) element.addEventListener(name, dispatch);
    }
  } else if (current && current === oldHandler) {
    delete events[key];
    element.removeEventListener(name, dispatch);
  }
};
