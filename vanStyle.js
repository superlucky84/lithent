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
const h = () => {
  console.log('h');
};

const tags = new Proxy(
  {},
  {
    get(target, tagName) {
      const f = (...allArgs) => {
        const [firstArgs, ...restArgs] = allArgs;
        const makeTagName = tagName;
        const existProps = typeof firstArgs === 'object';
        const props = existProps ? firstArgs : {};
        const childrens = existProps ? restArgs : allArgs;

        console.log(makeTagName);
        console.log(firstArgs, restArgs);
        console.log('PROPS', props);
        console.log('CHILDRENS', childrens);
      };
      return f;
    },
  }
);

const { div, p } = tags;

div({ a: 3 }, p());
