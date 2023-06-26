import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];
  const handle = () => {
    list = [
      { key: 7, value: 'seven' },
      { key: 6, value: 'six' },
      { key: 5, value: 'five' },
      { key: 4, value: 'four' },
    ];
    renew();
  };
  testChangeRef.value = () => {
    handle();
  };

  return () => (
    <Fragment>
      <button onClick={handle}>handle</button>
      {list.map(item => (
        <div key={item.key}>{item.value}</div>
      ))}
    </Fragment>
  );
});

document.body.innerHTML =
  '<ul id="list-root"> <li>1</li><li>2</li><li>3</li><li id="nextTarget">8</li><li>9</li> </ul>';

const testWrap = document.getElementById('list-root') as HTMLElement;

render(<Loop />, testWrap, document.getElementById('nextTarget'));

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("Tests if 'Lithent' correctly handles changes to the virtual DOM element when there is a loop element mixed between the real and virtual DOM elements.", () => {
    expect(testWrap.outerHTML).toBe(
      '<ul id="list-root"> <li>1</li><li>2</li><li>3</li><button>handle</button><div>4</div><div>5</div><div>6</div><div>7</div><li id="nextTarget">8</li><li>9</li> </ul>'
    );
  });

  it('It should only update the virtualDOM elements well, without changing the existing Real DOM elements.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<ul id="list-root"> <li>1</li><li>2</li><li>3</li><button>handle</button><div>seven</div><div>six</div><div>five</div><div>four</div><li id="nextTarget">8</li><li>9</li> </ul>'
      );
    });
  });
}
