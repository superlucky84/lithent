import { h, mount, type WDom } from './src/index';

// Render props 패턴 테스트
const DataProvider = mount((renew, _props, children: WDom[]) => {
  let data = { name: 'John', age: 30 };

  return () => {
    console.log('Children type:', typeof children[0]);
    console.log('Children:', children);

    // children이 함수인지 확인
    const firstChild = children[0];

    // Fragment 안에 함수가 있을 수 있으므로 확인
    const actualChild = firstChild?.type === 'f'
      ? firstChild.children?.[0]
      : firstChild;

    console.log('Actual child:', actualChild);

    // 함수면 호출, 아니면 그대로 렌더링
    if (typeof actualChild === 'function') {
      console.log('Calling render function with data:', data);
      return actualChild(data);
    }

    return <div>{children}</div>;
  };
});

// 테스트 1: 일반 children
const Test1 = mount(() => {
  return () => (
    <DataProvider>
      <div>Normal child</div>
    </DataProvider>
  );
});

// 테스트 2: 함수 children (render props)
const Test2 = mount(() => {
  return () => (
    <DataProvider>
      {(data: any) => <div>Name: {data.name}</div>}
    </DataProvider>
  );
});

console.log('Test 1 result:', <Test1 />);
console.log('Test 2 result:', <Test2 />);
