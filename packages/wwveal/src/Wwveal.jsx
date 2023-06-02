import { h, makeSignal, makeRef, mounted } from 'wwact';
import { wwveal, slides } from '@/wwveal.module.scss';
import { code as codeClass } from '@/wwveal.module.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Navi from '@/navi';

export function RenderCode({ codeString }) {
  const componentMaker = () => {
    return (
      <pre class={codeClass}>
        <code class="language-javascript hljs">{code(codeString)}</code>
      </pre>
    );
  };
  return componentMaker;
}

export function Wwveal(_props, children) {
  let { data, slidesElementRef, handleMounted, changeCursor, step } = useNavi();

  const componentMaker = () => {
    mounted(handleMounted);

    return (
      <div class={wwveal} style={{ color: data.color }}>
        <div class={slides} ref={slidesElementRef}>
          {children}
        </div>
        <Navi
          existSubContents={data.existSubContents}
          changeCursor={changeCursor}
          step={step}
        />
      </div>
    );
  };

  return componentMaker;
}

function code(originalString) {
  const matchs = originalString.match(/\n\s*/, '');
  const targetString = matchs[0];
  const tReg = new RegExp(targetString, 'g');

  return originalString.replace(targetString, '').replace(tReg, '\n');
}

function useNavi() {
  const slidesElementRef = makeRef(null);
  const data = makeSignal({ existSubContents: false, color: 'white' });
  const step = makeSignal({
    stepHorizontal: 0,
    stepVertical: 0,
  });
  let dimensions = {};

  let slidesElement = null;
  let resizeTimer = null;

  const calculateDimensions = () => {
    const res = {};
    const slideElementList = Array.from(slidesElementRef.value.children);

    slidesElement.style.transitionDuration = '0ms';
    const origStepHorizontal = step.stepHorizontal;
    const origStepVertical = step.stepVertical;

    step.stepHorizontal = 0;
    step.stepVertical = 0;
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

    step.stepHorizontal = origStepHorizontal;
    step.stepVertical = origStepVertical;
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
      updateExistSubContents();
      // const codes = slidesElement.querySelectorAll('code');
      hljs.highlightAll();
    });
  };

  const move = () => {
    const dimension = dimensions[`${step.stepHorizontal}-${step.stepVertical}`];

    if (dimension) {
      slidesElement.style.transform = `translate3d(${dimension.left * -1}px, ${
        dimension.top * -1
      }px, 0)`;
    }
  };

  const updateExistSubContents = () => {
    const hasSection = dimensions[`${step.stepHorizontal}-1`];

    if (hasSection) {
      data.existSubContents = true;
    } else {
      data.existSubContents = false;
    }
  };

  const moveStepHolizontal = type => {
    const nextDimension = dimensions[`${step.stepHorizontal + 1}-0`];
    const prevDimension = dimensions[`${step.stepHorizontal - 1}-0`];
    const allowNext = type === 'next' && nextDimension;
    const allowPrev = type === 'prev' && prevDimension;

    if (allowNext) {
      step.stepHorizontal += 1;
      step.stepVertical = 0;
    } else if (allowPrev) {
      step.stepHorizontal -= 1;
      step.stepVertical = 0;
    }

    updateExistSubContents();

    move();
  };

  const moveStepVertical = type => {
    const downDimension =
      dimensions[`${step.stepHorizontal}-${step.stepVertical + 1}`];
    const upDimension =
      dimensions[`${step.stepHorizontal}-${step.stepVertical - 1}`];

    const allowDown = type === 'down' && downDimension;
    const allowUp = type === 'up' && upDimension;

    if (allowDown) {
      step.stepVertical += 1;
    } else if (allowUp) {
      step.stepVertical -= 1;
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
    slidesElement,
    handleMounted,
    changeCursor,
    step,
  };
}
