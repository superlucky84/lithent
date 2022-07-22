declare namespace JSX {
  interface IntrinsicElements {
    [name: string]: any;
  }
}

interface Custom2 {
  children: JSX.Element[] | JSX.Element
}

// https://www.typescriptlang.org/ko/docs/handbook/jsx.html
interface Custom2 extends ClickableProps {
  home: JSX.Element;
}
