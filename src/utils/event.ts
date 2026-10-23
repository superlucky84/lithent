// Experimental DC-20: native registrations stay fixed when a callback changes.
// External callback identity/order is observably different from direct binding.
const eventSlots = Symbol();
type Handler = EventListenerOrEventListenerObject;
type Slot = { handler: Handler; handleEvent: (event: Event) => void };
type EventElement = HTMLElement & {
  [eventSlots]?: Record<string, Slot[]>;
};

function dispatch(this: Slot, event: Event) {
  const handler = this.handler;
  if (typeof handler === 'function') {
    handler.call(event.currentTarget, event);
  } else {
    handler.handleEvent(event);
  }
}

// Concurrent still binds native callbacks directly but shares portal teardown.
export const removeEvent = (
  element: EventElement,
  eventKey: string,
  handler: Handler
) => {
  const name = eventKey.slice(2).toLowerCase();
  const slots = element[eventSlots]?.[name];
  if (!slots) {
    element.removeEventListener(name, handler);
    return;
  }
  for (let index = 0; index < slots.length; index++) {
    if (slots[index].handler === handler) {
      element.removeEventListener(name, slots[index]);
      slots.splice(index, 1);
      return;
    }
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
  const events = (element[eventSlots] ||= Object.create(null));
  const slots = (events[name] ||= []);
  let oldIndex = -1;
  let newIndex = -1;
  for (let index = 0; index < slots.length; index++) {
    if (slots[index].handler === oldHandler) oldIndex = index;
    if (slots[index].handler === newHandler) newIndex = index;
  }
  if (oldIndex !== -1) {
    if (newHandler && newIndex === -1 && slots.length === 1) {
      slots[oldIndex].handler = newHandler;
      return;
    }
    element.removeEventListener(name, slots[oldIndex]);
    slots.splice(oldIndex, 1);
  }
  if (newHandler && newIndex === -1) {
    const slot = { handler: newHandler, handleEvent: dispatch };
    slots.push(slot);
    element.addEventListener(name, slot);
  }
};
