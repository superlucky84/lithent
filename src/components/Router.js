import { h, Fragment } from '../wDom';
import { makeData, mounted } from '@/hook';
import { addParams } from '@/hook/params';

export function Router({ props: { path, element }, children }) {
  const data = makeData({ targetPath: '' });
  const findPath = injectPath =>
    children.find(item => item.props.path === injectPath);

  const findDynamicPath = () =>
    children.find(item => /^:/.test(item.props.path));

  const handleHashChange = () => {
    const injectPath = window.location.hash.replace(/^[#\/]*/, '');
    let targetPath = findPath(injectPath);
    if (!targetPath) {
      targetPath = findDynamicPath(injectPath);
    }

    console.log('HASHCANGE ---- ', targetPath.props.path);

    data.targetPath = targetPath.props.path;
  };

  window.addEventListener('hashchange', handleHashChange);

  const makeComponent = () => {
    mounted(handleHashChange);

    return (
      <Fragment>
        {children.map(({ props: { element, path } }) => {
          return data.targetPath === path ? element : null;
        })}
      </Fragment>
    );
  };

  return makeComponent;
}

export function RouterItem({ props, children }) {
  return () => <div />;
}
