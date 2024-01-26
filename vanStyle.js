// h('section', null,
//   h('div', { class: 'wrap' },
//     h('ul', null,
//       h('li', null, 'item1'),
//       h('li', null, 'item2'),
//     )
//   )
// );
//
// //https://vanjs.org/tutorial
// <section>
//   <div class="wrap">
//     <ul>
//       <li>item1</li>
//       <li>item2</li>
//     </ul>
//   </div>
// </section>
//
// tag function(van style)
//
// section(
//   div({ class: 'wrap' })
// );
const h = (tagName, props, childrens) => {
  console.log('h', tagName, props, childrens);
};

const tags = new Proxy(
  {},
  {
    get(_, tagName) {
      const tagFunction = (...allArgs) => {
        const [firstArgs, ...restArgs] = allArgs;
        const existProps = typeof firstArgs === 'object';
        const props = existProps ? firstArgs : null;
        const childrens = existProps ? restArgs : allArgs;

        h(tagName, props, ...childrens);
      };
      return tagFunction;
    },
  }
);

const { div, p, a } = tags;

div({ a: 3 }, p('a', a({ href: 'ss' })));
