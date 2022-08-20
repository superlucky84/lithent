import { h, Fragment } from 'wwact';
import { makeData, effect, unmount } from 'wwact';
import { addParams } from '@/hook/params';

export function Router(_props, children) {
  const data = makeData({ targetPath: '' });
  const findPath = injectPath =>
    children.find(item => item.componentProps?.path === injectPath);

  const findDynamicPath = () =>
    children.find(item => /^:/.test(String(item?.componentProps?.path || '')));

  const handleHashChange = () => {
    const injectPath =
      window.location.hash.replace(/^[#\/]*/, '') ||
      String(children[0]?.componentProps?.path || '');
    let targetPath = findPath(injectPath);

    if (!targetPath) {
      targetPath = findDynamicPath();

      if (targetPath) {
        addParams(
          String(targetPath?.componentProps?.path || '').replace(/^:/, ''),
          injectPath
        );
      }
    }

    if (targetPath) {
      data.targetPath = String(targetPath?.componentProps?.path || '');
    }
  };

  const removeEvent = () => {
    console.log('unmount');
    window.removeEventListener('hashchange', handleHashChange);
  };

  window.addEventListener('hashchange', handleHashChange);

  effect(handleHashChange);
  unmount(removeEvent);

  const componentMaker = () => {
    return (
      <Fragment>
        {children.map(item => {
          const path = String(item?.componentProps?.path || '');
          const element = item?.componentProps?.element;

          return data.targetPath === path ? element : null;
        })}
      </Fragment>
    );
  };
  return componentMaker;
}

export function RouterItem() {
  return () => <div />;
}
