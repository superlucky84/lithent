import { h } from '@/wDom';
import { useDataStore } from '@/hook';

export default function NestedFragment() {
  const exampleData = useDataStore<{ title: string }>('example');

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
