import { mount } from 'lithent';

export const Thrower = mount(() => () => (
  <p class="storm-thrower">thrower original</p>
));
