import {
  h,
  Fragment,
  render,
  mount,
  Renew,
  ref,
  mountCallback,
  updateCallback,
} from 'lithent';
import { store } from 'lithent/helper';

const assignGlobalData = store({ value: 0, item: 'jjj' });

const Custom2 = mount<{ k: number; handle3: () => void }>(
  (r, _props, children) => {
    const globalData = assignGlobalData(r);
    const data = store({ v: 1 })(r);
    const gdataUpdate = () => {
      console.log('gdataUpdate');
      globalData.value += 1;
    };
    const toggleItem = () => {
      globalData.item = globalData.item === 'kkk' ? 'jjj' : 'kkk';
    };
    const handleMounted = () => {
      console.log('CUSTOM2 MOUNTED');
    };
    const handleUnmount = () => {
      console.log('CUSTOM2 UNMOUNT');
    };
    const handleUpdated = () => {
      console.log('CUSTOM2 UPDATED --');
    };
    const handleInputChane = (event: Event) => {
      data.v = Number((event.target as HTMLInputElement).value);
    };

    mountCallback(() => {
      handleMounted();

      return handleUnmount;
    });
    updateCallback(
      () => handleUpdated,
      () => [globalData.value]
    );

    return props => (
      <div class="custom2">
        {props.k}-0--------------{globalData.item}-{globalData.value}
        <input type="text" value={data.v} onInput={handleInputChane} />
        <button onClick={() => props.handle3()}>handle3</button>
        <button onClick={gdataUpdate}>gdataupdate</button>
        <button onClick={toggleItem}>handle4</button>
        <article>0{children}0</article>
      </div>
    );
  }
);

const useJw = (r: Renew) => {
  const data = store({ k: 7, j: 1 })(r);
  const data2 = store({ k: 1 })(r);

  const handle = () => {
    data.k += 1;
    // data.j += 1;
  };
  const handle2 = () => {
    data2.k += 1;
  };

  return { data, data2, handle, handle2 };
};

const CustomElement = mount(r => {
  const { data, data2, handle, handle2 } = useJw(r);
  const data3 = store({ k: 1 })(r);
  const handle3 = () => {
    console.log('action handle 3');
    data3.k += 1;
  };
  // const hadleRef = makeRef({ handle3 });
  const domRef = ref(null);

  const handleUpdatedDataK = () => {
    console.log('domRef', domRef);
    console.log('updated k', data);
    data3.k += 10;
  };
  const handleUpdatedData2K = () => {
    console.log('updated 2k', data2);
  };

  updateCallback(handleUpdatedDataK, () => [data.k]);
  updateCallback(handleUpdatedData2K, () => [data2.k]);

  return () => (
    <div class={`aaaaaaaaa${data.k}`}>
      <button onClick={handle}>!vava{data.k}aa</button>
      <button onClick={handle2}>{data2.k}-vava</button>
      <button onClick={handle3}>{data3.k}-vava</button>
      {data.k % 2 === 0 ? <span>m</span> : 'jinwoo'}
      {data.k % 2 === 1 ? (
        <Custom2 k={data.k} handle3={handle3}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </Custom2>
      ) : null}
      <div ref={domRef}>
        <div>data.k: {data.k}</div>
        <div>data.j: {data.j}</div>
        <div>data2.k: {data2.k}</div>
        <div>data3.k: {data3.k}</div>
      </div>
      <br />
      <br />
    </div>
  );
});

const Component = mount(() => {
  return () => (
    <div>
      <CustomElement />
      <CustomElement />
      <Fragment>
        <div>3</div>
        <div>3</div>
      </Fragment>
    </div>
  );
});

render(<Component />, document.getElementById('root'));
