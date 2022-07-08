/**
 * Jw 가상돔 diff 알고리즘 정책
 *
 * 1. 하위 노드 통째로 교체해 버려야 되는경우
 *   v 1-1. 태그이름 또는 컴포넌트 이름이 다를때
 *   1-2. 자식 노드의 개수가 틀릴때 (Fragment일 경우 컴포넌트 이름으로 체크가 안되므로)
 *    1-2-1. 같다면 children을 루프톨면서 배교해줌
 *   v 1-3. 부모 엘리먼트의 태그이름이 다를때
 * 2. 1번에 해당하지 않을 경우 props와 데이터만 일단 교체
 * 3. props와 data가 오리지날 가상돔과 얕은비교를 통해 완전히 같다면 children을 교체하지 않고 끝냄 (일단 구현 생략)
 * 4. props와 datark 오리지날 가상동과 얕은비교를 통해 틀리다면 children을 루프톨면서 배교해줌 (일단 구현생략)
 * 5. loop 타입은 일단 항상 다시 그리고 나중에 개선 (일단 구현 생략)
 *
 *
 * * 돔 반영 필요 상태
 * * * ADD, DELETE, DELETE-ADD, UPDATE, NONE
 * * * * (ADD). 오리지날이 없으면 추가되는 돔이므로 (추가, children들까지 재귀돌면서 전부 추가)
 * * * * (DELETE-ADD). 오리지날이 있고 같은 엘리먼트타입이 아닌 경우 기존 (삭제 후 추가,  children들까지 재귀돌면서 전부 추가)
 * * * * (DELETE). 오리지날이 있고 새로운 엘리먼트 타입은 null타입일 경우 (삭제)
 * * * * (UPDATE). 오리지날이 있고 같은 타입이며 props나 data가 변경되었으면 (돔 속성이나 에트리뷰트만 변경 후 children 재귀 체크)
 * * * * (NONE). 오리지날이 있고 같은 타입이며 props나 data가 같으면 (방치 후 children 재귀 체크) (Todo)
 */

import {
  checkFragment,
  checkTagElement,
  checkLoopElement,
  checkTextElement,
  checkEmptyElement,
  checkSameCustomComponent,
  checkSameFragment,
  checkSameTagElement,
  checkSameLoopElement,
  checkSameTextElement,
  checkCustemComponent,
} from '@/util';

export default function makeNewVdomTree({ originalVdom, newVdom }) {
  const isComponent = checkCustemComponent(newVdom);
  const isFragment = checkFragment(newVdom);
  const isTagElement = checkTagElement(newVdom);
  const isLoopElement = checkLoopElement(newVdom);
  const isTextElement = checkTextElement(newVdom);
  const isEmptyElement = checkEmptyElement(newVdom);
  let resultVdom;

  if (isComponent) {
    resultVdom = processingComponent({ originalVdom, newVdom });
  } else if (isFragment) {
    resultVdom = processingFragment({ originalVdom, newVdom });
  } else if (isTagElement) {
    resultVdom = processingTagElement({ originalVdom, newVdom });
  } else if (isLoopElement) {
    resultVdom = processingLoopElement({ originalVdom, newVdom });
  } else if (isTextElement) {
    resultVdom = processingTextElement({ originalVdom, newVdom });
  } else if (isEmptyElement) {
    resultVdom = processingNullElement({ originalVdom, newVdom });
  }

  resultVdom.oldProps = originalVdom?.props;

  return resultVdom;
}

function processingComponent({ originalVdom, newVdom }) {
  const isSameCustomComponent = checkSameCustomComponent({
    originalVdom,
    newVdom,
  });
  const existOriginalVdom = originalVdom && originalVdom.type;

  if (!existOriginalVdom || !isSameCustomComponent) {
    newVdom = newVdom();
    newVdom.children = newVdom.children.map(item => {
      const childVdom = makeNewVdomTree({ newVdom: item });
      return childVdom;
    });
  } else if (originalVdom && isSameCustomComponent) {
    newVdom = originalVdom.reRender();
    newVdom.children = newVdom.children.map((item, index) => {
      return makeNewVdomTree({
        newVdom: item,
        originalVdom: originalVdom.children[index],
      });
    });

    newVdom.el = originalVdom.el;
  }

  if (originalVdom) {
    newVdom.getParent = originalVdom.getParent;
    newVdom.getBrothers = originalVdom.getBrothers;

    const brothers = newVdom.getBrothers();
    const index = brothers.indexOf(originalVdom);

    brothers.splice(index, 1, newVdom);
  }

  if (!existOriginalVdom) {
    newVdom.needRerender = 'ADD';
  } else if (!isSameCustomComponent) {
    newVdom.needRerender = 'DELETE-ADD';
  } else if (isSameCustomComponent) {
    newVdom.needRerender = 'UPDATE';
  }

  return newVdom;
}

/**
 * 루프형은 우선 무조건 새로 만듬
 * 추후 키값 있을때는 원본 엘리먼트를 유지하도록 개선 예정
 */
function processingLoopElement({ originalVdom, newVdom }) {
  const isSameLoopElement = checkSameLoopElement({ originalVdom, newVdom });

  // Todo: 일단 항상 다시 돔에 반영
  newVdom.children = newVdom.children.map(item => {
    return makeNewVdomTree({ newVdom: item });
  });

  if (!originalVdom) {
    newVdom.needRerender = 'ADD';
  } else if (!isSameLoopElement) {
    newVdom.needRerender = 'DELETE-ADD';
  } else if (isSameLoopElement) {
    newVdom.needRerender = 'UPDATE';
  }

  return newVdom;
}

// renrender ok1
function processingTextElement({ originalVdom, newVdom }) {
  const isSameTextElement = checkSameTextElement({ originalVdom, newVdom });

  if (!originalVdom) {
    newVdom.needRerender = 'ADD';
  } else if (isSameTextElement) {
    newVdom.needRerender = 'NONE';
  } else {
    newVdom.needRerender = 'DELETE-ADD';
  }

  if (originalVdom?.el) {
    newVdom.el = originalVdom.el;
  }

  return newVdom;
}

function processingNullElement({ originalVdom, newVdom }) {
  newVdom.needRerender = 'DELETE';

  if (originalVdom?.el) {
    newVdom.el = originalVdom.el;
  }

  return newVdom;
}

function processingTagElement({ originalVdom, newVdom }) {
  const isSameTagElement = checkSameTagElement({ originalVdom, newVdom });
  const existOriginalVdom = originalVdom && originalVdom.type;

  if (!existOriginalVdom || !isSameTagElement) {
    newVdom.children = newVdom.children.map(item => {
      return makeNewVdomTree({ newVdom: item });
    });
  } else if (existOriginalVdom && isSameTagElement) {
    newVdom.children = newVdom.children.map((item, index) => {
      return makeNewVdomTree({
        newVdom: item,
        originalVdom: originalVdom.children[index],
      });
    });

    newVdom.el = originalVdom.el;
  }

  if (!existOriginalVdom) {
    newVdom.needRerender = 'ADD';
  } else if (!isSameTagElement) {
    newVdom.needRerender = 'DELETE-ADD';
  } else if (isSameTagElement) {
    newVdom.needRerender = 'UPDATE';
  }

  return newVdom;
}

function processingFragment({ originalVdom, newVdom }) {
  const isSameFragment = checkSameFragment({ originalVdom, newVdom });

  if (!originalVdom) {
    newVdom.needRerender = 'ADD';
  } else if (!isSameFragment) {
    newVdom.needRerender = 'DELETE-ADD';
  } else if (isSameFragment) {
    newVdom.needRerender = 'UPDATE';
  }

  if (!originalVdom || !isSameFragment) {
    newVdom.children = newVdom.children.map(item => {
      return makeNewVdomTree({ newVdom: item });
    });
  } else if (originalVdom && isSameFragment) {
    newVdom.children = newVdom.children = newVdom.children.map(
      (item, index) => {
        return makeNewVdomTree({
          newVdom: item,
          originalVdom: originalVdom.children[index],
        });
      }
    );
    newVdom.el = originalVdom.el;
  }

  return newVdom;
}
