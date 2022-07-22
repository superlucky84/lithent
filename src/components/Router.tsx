import { WDom } from '@/types';
import { h, Fragment } from '../wDom';
import { makeData, mounted, unmount } from '@/hook';
import { addParams } from '@/hook/params';

export function Router(_props: {}, children: WDom[]) {
  const data = makeData({ targetPath: '' });
  const findPath = (injectPath: string) =>
    children.find(item => item.componentProps.path === injectPath);

  const findDynamicPath = () =>
    children.find(item => /^:/.test(item.componentProps.path));

  const handleHashChange = () => {
    const injectPath =
      window.location.hash.replace(/^[#\/]*/, '') ||
      children[0].componentProps.path;
    let targetPath = findPath(injectPath);

    if (!targetPath) {
      targetPath = findDynamicPath();

      if (targetPath) {
        addParams(targetPath.componentProps.path.replace(/^:/, ''), injectPath);
      }
    }

    if (targetPath) {
      data.targetPath = targetPath.componentProps.path;
    }
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
