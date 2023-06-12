import { h, Fragment, TagFunction, mountCallback, mount } from 'wwact';
import { state } from 'wwact/helper';
import { addParams } from '@/hook/params';

export const Router: TagFunction = mount((renew, _props, children) => {
  const targetPathString = state<string>('', renew);
  const findPath = (injectPath: string) =>
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
      targetPathString.v = String(targetPath?.componentProps?.path || '');
    }
  };

  const removeEvent = () => {
    console.log('unmount');
    window.removeEventListener('hashchange', handleHashChange);
  };

  window.addEventListener('hashchange', handleHashChange);

  mountCallback(() => {
    handleHashChange();

    return removeEvent;
  });

  return () => (
    <Fragment>
      {children.map(item => {
        const path = String(item?.componentProps?.path || '');
        const element = item?.componentProps?.element;

        return targetPathString.v === path ? element : null;
      })}
    </Fragment>
  );
});

export const RouterItem: TagFunction = mount(function () {
  return () => <div />;
});
