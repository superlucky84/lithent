import { h, makeData, makeRef, mounted } from 'wwact';
import { wwveal, slides } from '@/wwveal.module.scss';
import Navi from '@/navi';

export default function Wwveal() {
  let { data, slidesElementRef, handleMounted, changeCursor } = useNavi();

  mounted(handleMounted);

  return (
    <div class={wwveal} style={{ color: data.color }}>
      <div class={slides} ref={slidesElementRef}>
        <section>
          <h1>나만의 커스텀 프레임웍 제작기</h1>
          <h2>Wwact(짝퉁 React)</h2>
        </section>
        <section>
          <h1>목차</h1>
          <ul>
            <li>1. Wwact 구현계기</li>
            <li>2. JSX 와 VDOM</li>
            <li>3. useState 분석과 프로토타이핑</li>
            <li>4. Diff 알고리즘</li>
            <li>5. Render 알고리즘</li>
            <li>6. fragment와 loop</li>
          </ul>
        </section>
        <section>
          <section>
            <h2>Wwact 구현이유</h2>
            <ul>
              <li>1. Wwact 구현계기</li>
            </ul>
          </section>
          <section>
            <h1>이유2</h1>
          </section>
        </section>
      </div>
      <Navi
        existSubContents={data.existSubContents}
        changeCursor={changeCursor}
      />
    </div>
  );
}

function useNavi() {
  const slidesElementRef = makeRef(null);
  const data = makeData({ existSubContents: false, color: 'white' });
  let dimensions = {};

  let stepHorizontal = 0;
  let stepVertical = 0;
  let slidesElement = null;
  let resizeTimer = null;

  const calculateDimensions = () => {
    const res = {};
    const slideElementList = Array.from(slidesElementRef.value.children);

    slidesElement.style.transitionDuration = '0ms';
    const origStepHorizontal = stepHorizontal;
    const origStepVertical = stepVertical;

    stepHorizontal = 0;
    stepVertical = 0;
    move();

    slideElementList.forEach((element, index) => {
      const children = Array.from(element.children);
      const hasSection = children.some(item => item.tagName === 'SECTION');

      if (hasSection) {
        children.forEach((childItem, childIndex) => {
          res[`${index}-${childIndex}`] = childItem.getBoundingClientRect();
        });
      } else {
        res[`${index}-${0}`] = element.getBoundingClientRect();
      }
    });

    dimensions = res;

    stepHorizontal = origStepHorizontal;
    stepVertical = origStepVertical;
    move();
  };

  const handleMounted = () => {
    slidesElement = slidesElementRef.value;

    window.addEventListener('keydown', e => {
      const keyToEventMap = {
        j: 'down',
        k: 'up',
        h: 'prev',
        l: 'next',
        ArrowRight: 'next',
        ArrowLeft: 'prev',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };

      if (keyToEventMap[e.key]) {
        changeCursor(keyToEventMap[e.key]);
      }
    });

    window.addEventListener('resize', () => {
      if (data.color === 'white') {
        data.color = 'black';
      }

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateDimensions();
        data.color = 'white';
      }, 300);
    });

    // Todo nexttick 구현
    Promise.resolve().then(() => {
      calculateDimensions();
    });
  };

  const move = () => {
    const dimension = dimensions[`${stepHorizontal}-${stepVertical}`];

    if (dimension) {
      slidesElement.style.transform = `translate3d(${dimension.left * -1}px, ${
        dimension.top * -1
      }px, 0)`;
    }
  };

  const moveStepHolizontal = type => {
    const nextDimension = dimensions[`${stepHorizontal + 1}-0`];
    const prevDimension = dimensions[`${stepHorizontal - 1}-0`];
    const allowNext = type === 'next' && nextDimension;
    const allowPrev = type === 'prev' && prevDimension;

    if (allowNext) {
      stepHorizontal += 1;
      stepVertical = 0;
    } else if (allowPrev) {
      stepHorizontal -= 1;
      stepVertical = 0;
    }

    const hasSection = dimensions[`${stepHorizontal}-1`];

    if (hasSection) {
      data.existSubContents = true;
    } else {
      data.existSubContents = false;
    }

    move();
  };

  const moveStepVertical = type => {
    const downDimension = dimensions[`${stepHorizontal}-${stepVertical + 1}`];
    const upDimension = dimensions[`${stepHorizontal}-${stepVertical - 1}`];

    const allowDown = type === 'down' && downDimension;
    const allowUp = type === 'up' && upDimension;

    if (allowDown) {
      stepVertical += 1;
    } else if (allowUp) {
      stepVertical -= 1;
    }

    move();
  };

  const changeCursor = type => {
    slidesElement.style.transitionDuration = '700ms';

    if (['up', 'down'].includes(type)) {
      moveStepVertical(type);
    } else if (['prev', 'next'].includes(type)) {
      moveStepHolizontal(type);
    }
  };

  return {
    data,
    slidesElementRef,
    stepHorizontal,
    slidesElement,
    handleMounted,
    changeCursor,
  };
}
