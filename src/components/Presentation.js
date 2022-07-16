import { h, Fragment } from '@/wDom';
import { makeRef, updated, makeData } from '@/hook';
import CustomElement from '@/components/CustomElement';

export default function NestedFragment({ props, children }) {
  const componentMaker = () => {
    return (
      <section>
        <h1>나만의 커스텀 프레임웍 제작기</h1>
        <ol>
          <li>ss</li>
          <li>ss</li>
        </ol>
      </section>
    );
  };

  return componentMaker;
}
