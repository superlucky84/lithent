import { h, render } from 'wwact';
import Wwveal, { RenderCode } from '@/Wwveal';

const vDom = (
  <Wwveal>
    <section>
      <h1>나만의 커스텀 프레임웍 제작기</h1>
      <h2>Wwact(짝퉁 React)</h2>
    </section>
    <section>
      <h3>목차</h3>
      <ol>
        <li>Wwact 구현계기</li>
        <li>Wwact 장점</li>
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
        <h1>Wwact 구현계기</h1>
      </section>
      <section>
        <h3>React 파악 욕구</h3>
        <p />
        <p>
          React가 정확히 어떤 원리로 동작하는지 모르고 사용한다는 죄책감이
          있었고, 어설프게 공부해서 어설프게 죄책감을 덜기 보다는 정확히 구현해
          보고 자신감을 얻고 싶음
        </p>
      </section>
      <section>
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
        <h1>Wwact 장점</h1>
      </section>
      <section>
        <h3>useMemo, useCallback을 안써도 됨</h3>
        <p />
        <p>
          컴포넌트 업데이트시 클로저를 활용하여 기존 상태나 함수를 유지하면서
          새로운 가상돔을 생성 - &nbsp;
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
        <h3>updated와 mounted의 명확한 분리</h3>
        <p />
        <p>
          React 함수형 스타일의 useEffect의 인터페이스는 간단한 상황에서는
          심플하지만, 복잡한 상황에서는 오히려 머리속을 복잡하게 만듬
        </p>
      </section>
      <section>
        <h3>가볍고 쉬움</h3>
        <p />
        <p>
          용량이 가벼워 부담없이 사용하기 좋고, 코드 베이스가 쉽기 때문에 문제
          발생시 누구나 쉽게 수정할 수 있음
        </p>
      </section>
    </section>
    <section>
      <section>
        <h1>JSX 와 가상돔</h1>
      </section>
      <section>
        <h3>JSX는 "함수 실행기"다 #1</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          const componentMaker = () => {
            return (
              <div class={\`aaaaaaaaa\${data.k}\`}>
                <button onClick={handle}>!vava{data.k}aa</button>
                {data.k % 2 === 0 ? <span>m</span> : 'jinwoo'}
                <Custom2 k={data.k} data={data} handle3={handle3}>
                  <span>1</span>
                </Custom2>
                <br />
              </div>
            );
          };
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h3>JSX는 "함수 실행기"다 #2</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          const componentMaker = () => {
            h("div", { class: \`aaaaaaaaa\${data.k}\` },
              h("button", { onClick: handle }, "!vava", data.k, "aa"),
              data.k % 2 === 0 ? h("span", null, "m") : 'jinwoo',
              h(Custom2, { k: data.k, data: data, handle3: handle3 },
                h("span", null, "1"),
              ),
              h("br", null),
            );
          };
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h3>함수가 실행되면 가상돔이 만들어진다</h3>
        <h3>가상돔은 dom의 상태를 표현하는 객체트리다</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          props: {class: 'aaaaaaaaa7'}
          children: Array(4)
            0: {type: 'element', tag: 'button', props: {…}, children: Array(3), getParent: ƒ, …}
            1: {type: 'text', text: 'jinwoo', el: text, getParent: ƒ}
            2: {type: 'element', tag: 'div', props: {…}, children: Array(12), componentProps: {…}, …}
            3: {type: 'element', tag: 'br', props: {…}, children: Array(0), getParent: ƒ, …}
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h3>가상돔을 이용해 실제 html을 그릴 수 있다</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          function vDomToDom(vDom) {
            const element = document.createElement(vdom.tag);
            const elementChildren = children.reduce(
              (acc: DocumentFragment, childItem: WDom) => {
                if (childItem.type) {
                  acc.appendChild(vDomToDom(childItem, init));
                }
                return acc;
              }, new DocumentFragment()
            );
            element.appendChild(elementChildren);
            return element;
          }
        `} />
        {/*eslint-enable */}
      </section>
    </section>
    <section>
      <section>
        <h1>useState 분석</h1>
        <h4>마운트 될때 initValue가 세팅된다</h4>
        <h4>업데이트 될때는 클로저에 세팅된 값을 찾아온다</h4>
      </section>
      <section>
        <h3>useState는 클로저를 이용하여 구현되었다</h3>
        <ul>
          <li>마운트 될때 initValue가 세팅된다</li>
          <li>업데이트 될때는 클로저에 세팅된 값을 찾아온다</li>
        </ul>
      </section>
      <section>
        <h4>한 컴포넌트에 여러개의 useState가 사용될 경우 처리 안됨</h4>
        {/*eslint-disable */}
        <RenderCode codeString={`
          const useState = initValue => {
            if (!value) {
              value = initValue;
            }

            const setData = newValue => {
              value = newValue;
            };

            return [value, setData];
          };

          export default function CustomElement(props = {}, children) {
            let vdom;
            const [v, setV] = useState(props.vava);
            ...
          }
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h4>컴포넌트 함수 내에서 useState가 여러번 실행될 때</h4>
        <h5>useState가 실행되는 순서가 항상 같음을 이용</h5>
        {/*eslint-disable */}
        <RenderCode codeString={`
          const value = {};
          let stateCallSeq = 0;

          const useState = (initValue, vdomKey) => {
            const currentSubSeq = stateCallSeq;

            if (!value[currentSubSeq]) {
              value[currentSubSeq] ??= [];
              value[currentSubSeq] = initValue;
            }

            const setData = newValue => {
              value[currentSubSeq] = newValue;
            };

            stateCallSeq += 1;

            return [value[currentSubSeq], setData];
          };
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h4>하나의 컴포넌트가 여러 곳에서 사용될때 처리</h4>
        {/*eslint-disable */}
        <RenderCode codeString={`
          const useState = (initValue, vdomKey) => {
            if (!value[vdomKey] || !value[vdomKey][currentSubSeq]) {
              value[vdomKey] ??= {};
              value[vdomKey][currentSubSeq] ??= {};
              value[vdomKey][currentSubSeq] = initValue;
            }

            const setData = newValue => {
              value[vdomKey][currentSubSeq] = newValue;
            };

            stateCallSeq += 1;

            return [value[vdomKey][currentSubSeq], setData];
          };
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h3>Hook 인터페이스 따라하기 (개선 전)</h3>
        <ul>
          <li>
            <a href="https://github.com/superlucky84/jwVDomPrototype/blob/1aa1af064a3a524050fc1f8954b3fed3f376ab87/src/jsx.js#L59">
              useState구현
            </a>
          </li>
          <li>
            <a href="https://github.com/superlucky84/jwVDomPrototype/blob/1aa1af064a3a524050fc1f8954b3fed3f376ab87/src/components/CustomElement.js#L3">
              useState사용
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h3>Hook 인터페이스 따라하기 (개선 후)</h3>
        <ul>
          <li>
            <a href="https://github.com/superlucky84/jwVDomPrototype/blob/master/src/components/CustomElement.js">
              useState사용
            </a>
          </li>
          <li>
            <a href="https://github.com/superlucky84/jwVDomPrototype/blob/master/src/hook/useState.js">
              useState구현 - 1
            </a>
          </li>
          <li>
            <a href="https://github.com/superlucky84/jwVDomPrototype/blob/master/src/jsx.js#L43">
              useState구현 - 2
            </a>
          </li>
        </ul>
      </section>
    </section>
    <section>
      <section>
        <h1>Diff 알고리즘</h1>
      </section>
      <section>
        <h3>비교 알고리즘 컨셉</h3>
        <h5>
          <a href="https://ko.reactjs.org/docs/reconciliation.html">
            https://ko.reactjs.org/docs/reconciliation.html
          </a>
        </h5>
        <p />
        <p>
          동일한 컴포넌트 함수는 항상 동일한 개수의 자식을 생성하므로 항상 같은
          레벨에서 비교 가능하다.
        </p>
        <p>
          서로 다른 컴포넌트 함수는 전혀 다른 트리를 생성하므로 하위 트리는 전혀
          다른 구조의 트리 구조를 작으므로 그냥 교체해버리면 된다.
        </p>
      </section>
      <section>
        <h3>비교 알고리즘 컨셉</h3>
        <img src="https://miro.medium.com/max/1400/1*JVIONc4gA_iCxmBycD3A3Q.png" />
      </section>
      <section>
        <h3>가상돔 생성 지연 시키기</h3>
        <h4>
          <a href="https://github.com/superlucky84/jwVDomPrototype/blob/master/src/jsx.js#L43">
            예제코드
          </a>
        </h4>
        <p></p>
        <p>
          컴포넌트 트리를 비교하면서 타입이 같을 경우 componentKey를 유지시켜
          줘야 하기 때문에 컴포넌트 함수가 바로 가상돔을 만들지 못하게 지연시킴
        </p>
      </section>
      <section>
        <h2>Component 키 상속하기</h2>
        <p></p>
        <h4>
          <a href="https://github.com/superlucky84/jwVDomPrototype/blob/master/src/jsx.js#L43">
            오리지널 키값을 전달받아, 컴포넌트 함수 자체를 새로 실행하기
          </a>
        </h4>
      </section>
      <section>
        <h2>상속없이 오리지날 활용하기</h2>
        <p></p>
        <h4>
          <a href="https://github.com/superlucky84/wwact/blob/master/packages/wwact/src/components/Custom2.tsx">
            오리지날 가상돔이 가지고 있는 makeComponent 함수 부분만 실행하기
          </a>
        </h4>
      </section>
    </section>
    <section>
      <section>
        <h1>Render 알고리즘</h1>
      </section>
      <section>
        <h3>처음 한번 html그리기</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          function vDomToDom(vDom) {
            const element = document.createElement(vdom.tag);
            const elementChildren = children.reduce(
              (acc: DocumentFragment, childItem: WDom) => {
                if (childItem.type) {
                  acc.appendChild(vDomToDom(childItem, init));
                }
                return acc;
              }, new DocumentFragment()
            );
            element.appendChild(elementChildren);
            return element;
          }
        `} />
        {/*eslint-enable */}
      </section>
      <section>
        <h3>tree 업데이트시 변경 타입 정하기</h3>
        {/*eslint-disable */}
        <RenderCode codeString={`
          /**
           * Rerender시 실제 dom에 반영해줘야 하는 상태
           *
           * 1. (ADD). 가상돔 비교시 오리지날이 없으면 새로 추가되는 dom으로 판단한다.
           * 2. (REPLACE). 오리지날이 있고 같은 엘리먼트타입이 아닌 경우 해당 위치의 태그 자체를 교체해준다.
           * 3. (UPDATE). 오리지날이 있고 같은 타입이면 dom의 속성만 변경해 주며, 텍스트 노드일 경우는 텍스트를 교체해준다.
           * 4. (DELETE). 오리지날이 있고 새로운 엘리먼트 타입은 null타입일 경우 dom을 삭제한다.
           * 5. (SORTED-REPLACE). loop의 경우 REPLACE라도 키값에 의해 순서가 변경될 수 있으므로 새로운 dom을 단순히 기존 위치에 교체하지 않고 새로 삼입하여 정렬한다.
           * 6. (SORTED-UPDATE). loop의 경우 UPDATE라도 키값에 의해 순서가 변경될수 있으므로 재 삽입하여 정렬한다.
           * 7. (NONE). text타입의 경우 text가 같다면 변경이 필요 없으므로 방치한다. (Todo. 다른 타입의 경우 처리필요)
           */
        `} />
        {/*eslint-enable */}
      </section>
    </section>
    <section>
      <section>
        <h1>fragment와 loop</h1>
      </section>
      <section>
        <h2>중첩된 가상타입 내에서 요소의 위치 찾기</h2>
        <h4>
          <a href="https://github.com/superlucky84/wwact/blob/master/packages/wwact/src/components/NestedFragment.tsx">
            리얼 dom 업데이트시 부모와 자식 가상돔을 전부 다 탐색해야 함
          </a>
        </h4>
      </section>
    </section>
    <section>
      <section>
        <h2>Store 구현</h2>
        <h4>
          <a href="https://github.com/superlucky84/wwact/blob/master/packages/wwact/src/hook/dataStore.ts">
            프록시를 활용
          </a>
        </h4>
        <p>
          훅을 사용하는 컴포넌트의 rerender 함수실행을 리스트에 넣어놓고, 스토어
          변경이 있을때마다 리스트에 넣어놓은 함수를 실행시킴
        </p>
      </section>
    </section>
    <section>
      <section>
        <h2>Router 구현</h2>
      </section>
    </section>
  </Wwveal>
);
// @ts-ignore
window.vDom = vDom;

render(vDom, document.body);
