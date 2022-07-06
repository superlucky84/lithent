import { h, Fragment } from '../jsx';

export default function Custom2({ props, children }) {
  return (
    <div class="custom2">
      {props.k}
      <article>{children}</article>
    </div>
  );
}
