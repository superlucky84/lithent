import { h, makeData, makeRef, mounted } from 'wwact';
import { wwveal, slides, code as codeClass } from '@/wwveal.module.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Navi from '@/navi';

function code(originalString) {
  const matchs = originalString[0].match(/\n\s*/, '');
  const targetString = matchs[0];
  const tReg = new RegExp(targetString, 'g');

  return originalString[0].replace(targetString, '').replace(tReg, '\n');
}

export default function Wwveal() {
  let { data, slidesElementRef, handleMounted, changeCursor } = useNavi();

  const componentMaker = () => {
    mounted(handleMounted);

    return (
      <div class={wwveal} style={{ color: data.color }}>
        <div class={slides} ref={slidesElementRef}>
          <section>
            <h1>나만의 커스텀 프레임웍 제작기</h1>
            <h2>Wwact(짝퉁 React)</h2>
          </section>
          <section>
            <h2>목차</h2>
            <ol>
              <li>Wwact 구현계기</li>
              <li>Wwact 자랑</li>
              <li>JSX 와 가상돔</li>
              <li>useState 분석</li>
              <li>Diff 알고리즘</li>
              <li>Render 알고리즘</li>
              <li>fragment와 loop</li>
              <li>Store 구현하기</li>
              <li>Router 구현하기</li>
            </ol>
          </section>
          <section>
            <section>
              <h2>Wwact 구현계기 #1</h2>
              <h3>React 파악 욕구</h3>
              <p />
              <p>
                React가 정확히 어떤 원리로 동작하는지 모르고 사용한다는 죄책감이
                있었고, 어설프게 공부해서 어설프게 죄책감을 덜기 보다는 정확히
                구현해 보고 자신감을 얻고 싶음
              </p>
            </section>
            <section>
              <h2>Wwact 구현계기 #2</h2>
              <h3>개인프로젝트에 사용</h3>
              <p />
              <ul>
                <li>React를 사용한 개인프로젝트의 버전업이 귀찮음</li>
                <li>필요한 정도의 기능만 가볍게 만들어서 쓰고 싶음</li>
              </ul>
            </section>
          </section>
          <section>
            <section>
              <h2>Wwact 자랑 #1</h2>
              <h3>useMemo, useCallback을 안써도 됨</h3>
              <p />
              <p>
                컴포넌트 업데이트시 클로저를 활용하여 기존 상태나 함수를
                유지하면서 새로운 가상돔을 생성 - &nbsp;
                <a
                  target="_blank"
                  href="https://github.com/superlucky84/wwact/blob/master/packages/wwveal/src/Wwveal.jsx"
                >
                  example link
                </a>
              </p>
              <p>디펜던시 배열을 매번 신경쓰지 않고 코딩 가능</p>
            </section>
            <section>
              <h2>Wwact 자랑 #2</h2>
              <h3>updated와 mounted의 명확한 분리</h3>
              <p />
              <p>
                React 함수형 스타일의 useEffect의 인터페이스는 간단한 상황에서는
                심플하지만, 복잡한 상황에서는 오히려 머리속을 복잡하게 만듬
              </p>
            </section>
            <section>
              <h2>Wwact 자랑 #3</h2>
              <h3>가볍고 쉬움</h3>
              <p />
              <p>
                용량이 가벼워 부담없이 사용하기 좋고, 코드 베이스가 쉽기 때문에
                문제 발생시 누구나 쉽게 수정할 수 있음
              </p>
            </section>
          </section>
          <section>
            <section>
              <h2>JSX 와 가상돔 #1</h2>
              <h3>JSX는 "함수 실행기"다</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>JSX 와 가상돔 #2</h2>
              <h3>함수가 실행되면 가상돔이 만들어진다</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>JSX & VDOM #3</h2>
              <h3>가상돔은 dom의 상태를 표현하는 객체트리다</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>JSX & VDOM #4</h2>
              <h3>가상돔을 이용해 실제 html을 그릴 수 있다</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>useState 분석 #1</h2>
              <h3>useState는 클로저를 이용하여 구현되었다</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>useState 분석 #2</h2>
              <h3>컴포넌트 함수 내에서 useState가 여러번 실행될 때</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>useState 분석 #3</h2>
              <h3>생성된 컴포넌트별로 상태를 기억하는 방법</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>useState 분석 #4</h2>
              <h3>Hook 인터페이스 따라하기</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>Diff 알고리즘 #1</h2>
              <h3>변경 이벤트가 발생한 tree상의 변경점 찾기</h3>
              <pre class={codeClass}>
                <code class="language-javascript hljs">{code`
                  var a = 3;
                  var b = 'k';
                  function name() {
                    console.log('k');
                  }
                `}</code>
              </pre>
            </section>
            <section>
              <h2>Diff 알고리즘 #2</h2>
              <h3>비교 알고리즘 컨셉</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>Diff 알고리즘 #3</h2>
              <h3>비교 알고리즘 구상</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>Diff 알고리즘 #4</h2>
              <h3>Component 키 상속하기</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>Diff 알고리즘 #5</h2>
              <h3>상속없이 오리지날 활용하기</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>Render 알고리즘 #1</h2>
              <h3>처음 한번 html그리기</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>Render 알고리즘 #2</h2>
              <h3>dom 변경 타입 정하기</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>Render 알고리즘 #3</h2>
              <h3>html 업데이트 하기</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>fragment와 loop #1</h2>
              <h3>fragment의 이해</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>fragment와 loop #2</h2>
              <h3>loop의 이해</h3>
              <p />
              <p>a</p>
            </section>
            <section>
              <h2>fragment와 loop #3</h2>
              <h3>중첩된 가상타입 내에서 요소의 위치 찾기</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>Store 구현</h2>
              <h3>변경지점 기억시키기</h3>
              <p />
              <p>a</p>
            </section>
          </section>
          <section>
            <section>
              <h2>Router 구현</h2>
              <p />
              <p>a</p>
            </section>
          </section>
        </div>
        <Navi
          existSubContents={data.existSubContents}
          changeCursor={changeCursor}
        />
      </div>
    );
  };

  return componentMaker;
}

function useNavi() {
  const slidesElementRef = makeRef(null);
  const data = makeData({ existSubContents: false, color: 'white' });
  let dimensions = {};

  let stepHorizontal = 6;
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
      updateExistSubContents();
      // const codes = slidesElement.querySelectorAll('code');
      hljs.highlightAll();
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

  const updateExistSubContents = () => {
    const hasSection = dimensions[`${stepHorizontal}-1`];

    if (hasSection) {
      data.existSubContents = true;
    } else {
      data.existSubContents = false;
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

    updateExistSubContents();

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
