import { h } from 'wwact';

export default function Navi(props) {
  const componentMaker = () => {
    const { existSubContents, changeCursor } = props;

    return (
      <nav>
        {existSubContents && (
          <div>
            <div onClick={() => changeCursor('up')}>up</div>
          </div>
        )}
        <div>
          <div onClick={() => changeCursor('prev')}>prev</div>
          {existSubContents && (
            <div onClick={() => changeCursor('down')}>down</div>
          )}
          <div onClick={() => changeCursor('next')}>next</div>
        </div>
      </nav>
    );
  };

  return componentMaker;
}
