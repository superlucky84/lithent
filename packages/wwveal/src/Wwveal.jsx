import { h, makeData, makeRef, mounted } from 'wwact';
import { wwveal, slides } from '@/wwveal.module.scss';

export default function Wwveal() {
  let { data, slidesElementRef, handleMounted, handlePrev, handleNext } =
    useNavi();

  const componentMaker = () => {
    mounted(handleMounted);

    return (
      <div class={wwveal}>
        <div class={slides} ref={slidesElementRef}>
          <section>
            <h1>나만의 커스텀 프레임웍 제작기</h1>
            <h2>WWACT</h2>
          </section>
          <section>
            <h1>목차</h1>
            <ol>
              <li>wwact 구현이유</li>
              <li>JSX 와 VDOM</li>
            </ol>
          </section>
          <section>
            <h1>이유</h1>
          </section>
        </div>
        <nav>
          {data.existSubContents && (
            <div>
              <div onClick={handlePrev}>up</div>
            </div>
          )}
          <div>
            <div onClick={handlePrev}>prev</div>
            {data.existSubContents && <div onClick={handlePrev}>down</div>}
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

  let step = 0;
  let slidesElement = null;
  let slideLength = 0;
  let slideElementList = [];
  let translateX = 0;

  const handleMounted = () => {
    slidesElement = slidesElementRef.value;
    slideElementList = Array.from(slidesElementRef.value.children);
    slideLength = slideElementList.length;

    // Todo nexttick 구현
    Promise.resolve().then(() => {
      moveStepNumber();
    });
  };

  const moveStepNumber = () => {
    const element = slideElementList[step];
    const { left } = element.getBoundingClientRect();

    translateX -= left;
    slidesElement.style.transform = `translate3d(${translateX}px, 0, 0)`;

    if (step === 1) {
      data.existSubContents = true;
    } else {
      data.existSubContents = false;
    }
  };

  const moveStep = type => {
    const allowNext = type === 'next' && step + 1 < slideLength;
    const allowPrev = type === 'prev' && step - 1 >= 0;

    if (allowNext) {
      step += 1;
    } else if (allowPrev) {
      step -= 1;
    }

    moveStepNumber();
  };

  const handlePrev = () => {
    moveStep('prev');
  };

  const handleNext = () => {
    moveStep('next');
  };

  return {
    data,
    slidesElementRef,
    step,
    slidesElement,
    slideLength,
    slideElementList,
    translateX,
    handleMounted,
    handlePrev,
    handleNext,
  };
}
