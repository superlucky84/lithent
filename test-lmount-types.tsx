// 사용자가 lmount를 사용할 때 타입 추론 테스트
import { h, lmount, useRenew } from './src/index';

// 테스트 1: props 타입 추론
type MyProps = {
  name: string;
  age: number;
};

const TypedComponent = lmount<MyProps>((props, children) => {
  // props 타입이 제대로 추론되는가?
  const name: string = props.name; // OK
  const age: number = props.age; // OK
  // const wrong: boolean = props.name; // 에러 발생해야 함

  const renew = useRenew();

  return () => <div>{props.name}</div>;
});

// 테스트 2: JSX에서 사용할 때 props 타입 체크
const App = () => {
  return (
    <div>
      {/* props가 제대로 체크되는가? */}
      <TypedComponent name="John" age={30} />

      {/* 타입 에러가 발생해야 함 */}
      {/* <TypedComponent name="John" /> */}
      {/* <TypedComponent name="John" age="30" /> */}
    </div>
  );
};

// 테스트 3: 타입 없이 사용
const UntypedComponent = lmount((props, children) => {
  // props는 Partial<Record<string, unknown>> 타입
  const data = props.data; // any 타입으로 추론됨

  return () => <div>Untyped</div>;
});

// 테스트 4: useRenew 타입 체크
const WithRenew = lmount<{ count: number }>((props, children) => {
  const renew = useRenew();

  // renew의 타입이 () => boolean인가?
  const result: boolean = renew();

  return () => <div>{props.count}</div>;
});
