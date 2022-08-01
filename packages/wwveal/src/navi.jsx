import { h } from 'wwact';

export default function Navi(props) {
  const componentMaker = () => {
    const {
      existSubContents,
      changeCursor,
      step: { stepHorizontal, stepVertical },
    } = props;

    return (
      <nav>
        <div>
          {stepHorizontal} - {stepVertical}
        </div>
        {existSubContents && (
          <div>
            <div onClick={() => changeCursor('up')}>up(k)</div>
          </div>
        )}
        <div>
          <div onClick={() => changeCursor('prev')}>prev(h)</div>
          {existSubContents && (
            <div onClick={() => changeCursor('down')}>down(j)</div>
          )}
          <div onClick={() => changeCursor('next')}>next(l)</div>
        </div>
      </nav>
    );
  };

  return componentMaker;
}
