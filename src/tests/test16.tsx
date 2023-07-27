import { h, Fragment, render, mount, nextTick } from '@/index';

const Loop = mount(function () {
  const list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];

  return () => (
    <Fragment>
      {list.map(item => (
        <div key={item.key} class="text-orange-300">
          {item.value}
        </div>
      ))}
    </Fragment>
  );
});

document.body.innerHTML =
  '<ul id="root" > <li>1</li> <li>2</li> <li>3</li> <li id="next" id="nextTarget"> 8 </li> <li>9</li> </ul>';

const testWrap = document.getElementById('root') as HTMLElement;

const destroy = render(<Loop />, testWrap, document.getElementById('next'));

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("The 'destroy function' also works well when the loop type is stuck in the middle of the actual DOM.", () => {
    setTimeout(() => {
      expect(testWrap.outerHTML).toBe(
        '<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <div class="text-orange-300">4</div><div class="text-orange-300">5</div><div class="text-orange-300">6</div><div class="text-orange-300">7</div><li id="next"> 8 </li> <li>9</li> </ul>'
      );

      nextTick().then(() => {
        it('The destroy function should work fine.', () => {
          destroy();
          expect(testWrap.outerHTML).toBe(
            '<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <li id="next"> 8 </li> <li>9</li> </ul>'
          );
        });
      });
    }, 100);
  });
}
