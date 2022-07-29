import { h, makeData, makeRef, mounted } from 'wwact';
import { wwveal, slides } from '@/wwveal.module.scss';

export default function Wwveal() {
  let {
    data,
    slidesElementRef,
    handleMounted,
    handlePrev,
    handleNext,
    handleUp,
    handleDown,
  } = useNavi();

  const componentMaker = () => {
    mounted(handleMounted);

    return (
      <div class={wwveal}>
        <div class={slides} ref={slidesElementRef}>
          <section>
            <h1>나만의 커스텀 프레임웍 제작기</h1>
            <h2>Wwact</h2>
            <h3>짝퉁 React</h3>
          </section>
          <section>
            <h1>목차</h1>
            <ol>
              <li>Wwact 구현이유</li>
              <li>Wwact의 장점</li>
              <li>JSX 와 VDOM</li>
              <li>Diff 알고리즘</li>
              <li>Render 알고리즘</li>
              <li>Router 컴포넌트 구현 방법</li>
            </ol>
          </section>
          <section>
            <section>
              <h1>이유1</h1>
            </section>
            <section>
              <h1>이유2</h1>
            </section>
          </section>
        </div>
        <nav>
          {data.existSubContents && (
            <div>
              <div onClick={handleUp}>up</div>
            </div>
          )}
          <div>
            <div onClick={handlePrev}>prev</div>
            {data.existSubContents && <div onClick={handleDown}>down</div>}
            <div onClick={handleNext}>next</div>
          </div>
        </nav>
      </div>
    );
  };

  return componentMaker;
}

function useNavi() {
  const slidesElementRef = makeRef(null);
  const data = makeData({ existSubContents: false });

  let stepHorizontal = 2;
  let stepVertical = 0;
  let slidesElement = null;
  let slideLength = 0;
  let slideElementList = [];

  let slideSubLength = 0;
  let slideSubElementList = [];

  let translateX = 0;
  let translateY = 0;

  const handleMounted = () => {
    slidesElement = slidesElementRef.value;
    slideElementList = Array.from(slidesElementRef.value.children);
    slideLength = slideElementList.length;

    // Todo nexttick 구현
    Promise.resolve().then(() => {
      moveStepNumberHorizontal();
      moveStepNumberVertical();
    });
  };

  const updateSubStep = sublist => {
    slideSubElementList = sublist;
    slideSubLength = slideSubElementList.length;
  };

  const moveStepNumberVertical = () => {
    const element = slideSubElementList[stepVertical];
    const { top } = element.getBoundingClientRect();

    translateY -= top;

    slidesElement.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  };

  const moveStepNumberHorizontal = () => {
    const element = slideElementList[stepHorizontal];
    const { left } = element.getBoundingClientRect();

    translateX -= left;
    slidesElement.style.transform = `translate3d(${translateX}px, 0, 0)`;

    const hasSection = Array.from(element.children).some(
      item => item.tagName === 'SECTION'
    );

    if (hasSection) {
      updateSubStep(Array.from(element.children));
      data.existSubContents = true;
      element.style.justifyContent = 'start';
    } else {
      updateSubStep([]);
      translateY = 0;
      data.existSubContents = false;
    }
  };

  const moveStepHolizontal = type => {
    const allowNext = type === 'next' && stepHorizontal + 1 < slideLength;
    const allowPrev = type === 'prev' && stepHorizontal - 1 >= 0;

    if (allowNext) {
      stepHorizontal += 1;
    } else if (allowPrev) {
      stepHorizontal -= 1;
    }

    moveStepNumberHorizontal();
  };

  const moveStepVertical = type => {
    const allowDown = type === 'down' && stepVertical + 1 < slideSubLength;
    const allowUp = type === 'up' && stepVertical - 1 >= 0;

    if (allowDown) {
      stepVertical += 1;
    } else if (allowUp) {
      stepVertical -= 1;
    }

    moveStepNumberVertical();
  };

  const handleUp = () => {
    moveStepVertical('up');
  };

  const handleDown = () => {
    moveStepVertical('down');
  };

  const handlePrev = () => {
    moveStepHolizontal('prev');
  };

  const handleNext = () => {
    moveStepHolizontal('next');
  };

  return {
    data,
    slidesElementRef,
    stepHorizontal,
    slidesElement,
    slideLength,
    slideElementList,
    translateX,
    handleMounted,
    handlePrev,
    handleNext,
    handleUp,
    handleDown,
  };
}
