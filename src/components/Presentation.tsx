import { h, Fragment } from '@/wDom';
import { makeRef, updated, makeData, useDataStore } from '@/hook';
import CustomElement from '@/components/CustomElement';

export default function NestedFragment(props, children) {
  const exampleData = useDataStore('example');

  const componentMaker = () => {
    return (
      <section>
        <h1>{exampleData.title}</h1>
        <ol>
          <li>ss</li>
          <li>ss</li>
        </ol>
      </section>
    );
  };

  return componentMaker;
}
