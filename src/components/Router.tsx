import { h, Fragment } from '../wDom';
import { makeData, mounted, unmount } from '@/hook';
import { addParams } from '@/hook/params';

export function Router(props, children) {
  const data = makeData({ targetPath: '' });
  const findPath = injectPath =>
    children.find(item => item.componentProps.path === injectPath);

  const findDynamicPath = () =>
    children.find(item => /^:/.test(item.componentProps.path));

  const handleHashChange = () => {
    const injectPath =
      window.location.hash.replace(/^[#\/]*/, '') ||
      children[0].componentProps.path;
    let targetPath = findPath(injectPath);

    if (!targetPath) {
      targetPath = findDynamicPath(injectPath);

      addParams(targetPath.componentProps.path.replace(/^:/, ''), injectPath);
    }

    data.targetPath = targetPath.componentProps.path;
  };

  const removeEvent = () => {
    window.removeEventListener('hashchange', handleHashChange);
  };

  window.addEventListener('hashchange', handleHashChange);

  const makeComponent = () => {
    mounted(handleHashChange);
    unmount(removeEvent);

    return (
      <Fragment>
        {children.map(({ componentProps: { element, path } }) => {
          return data.targetPath === path ? element : null;
        })}
      </Fragment>
    );
  };

  return makeComponent;
}

export function RouterItem() {
  return () => <div />;
}
