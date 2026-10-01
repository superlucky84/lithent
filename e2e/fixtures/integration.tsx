import { Fragment, mount, lmount, render, portal } from 'lithent';
import * as core from 'lithent';
import { createContext, createLContext } from 'lithent/helper';

const context = createContext<{ name: string }>();
const light = createLContext<{ name: string }>();
const Consumer = mount(renew => {
  const value = context.useContext(context, renew, ['name']);
  return () => <output id="context">{value.name.value}</output>;
});
const LConsumer = lmount(() => {
  const value = light.useContext(light, ['name']);
  return () => <output id="lcontext">{value.name.value}</output>;
});
const Nested = mount(() => () => (
  <section>
    <Consumer />
    <LConsumer />
  </section>
));
const App = mount(renew => {
  const value = context.contextState('outer');
  const lvalue = light.contextState('light');
  let message = 'portal initial';
  const update = () => {
    value.value = 'updated';
    lvalue.value = 'light updated';
    const scope = () => {
      message = 'portal deferred';
      renew();
    };
    if (document.documentElement.dataset.core === 'concurrent') {
      (
        core as typeof core & { deferRender: (scope: () => void) => void }
      ).deferRender(scope);
    } else scope();
  };
  const Provider = context.Provider;
  const LProvider = light.Provider;
  return () => (
    <Fragment>
      <button onClick={update}>update context and portal</button>
      <Provider name={value}>
        <LProvider name={lvalue}>
          <Nested />
        </LProvider>
      </Provider>
      {portal(
        <strong id="portal-content">{message}</strong>,
        document.querySelector('#portal-host') as HTMLElement
      )}
    </Fragment>
  );
});
render(<App />, document.querySelector('#app'));
