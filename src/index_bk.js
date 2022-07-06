import {
  Fragment,
  jsx,
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
} from 'snabbdom';

const patch = init(
  [
    // Init patch function with chosen modules
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
    classModule, // makes it easy to toggle classes
  ],
  undefined,
  {
    experimental: {
      fragments: true,
    },
  }
);

let oldNode;
const v = 'j';
const w = 'kkk';
const n = '3';

const node = (
  <div va={n} style={{ fontWeight: 'bold' }}>
    <Fragment>
      <span>3ll</span>
      <span>
        3lll{w}
        <b> 7 </b>3www
      </span>
    </Fragment>
    ss{v}ss
  </div>
);

console.log(node);

// const root = document.getElementById('root');
// console.log(node);
oldNode = patch(root, node);
console.log(oldNode);

export default {
  node,
};
