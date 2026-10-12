export const createHmrBootstrapBlock = (
  _targetExports: string[],
  componentNames: string[]
) => {
  return `
const __lithentModuleUrl = new URL(import.meta.url);
__lithentModuleUrl.searchParams.delete('t');
const __lithentModuleId = __lithentModuleUrl.pathname + __lithentModuleUrl.search;
const __lithentInvalidateCountKey = \`__lithent_hmr_invalidate_count__\${__lithentModuleId}\`;
const __lithentGlobalStore = globalThis;
const __lithentHotData = import.meta.hot?.data;
const __lithentModuleHotStore = __lithentHotData
  ? (__lithentHotData.components ??= Object.create(null))
  : Object.create(null);
const __lithentCurrentComponents = Object.create(null);
if (__lithentHotData) __lithentHotData.currentComponents = __lithentCurrentComponents;
let __lithentExportSnapshot;
const __lithentRenderDisposers = __lithentHotData
  ? (__lithentHotData.renderDisposers ??= new Map()) : new Map();
const __lithentRenderOnce = (id, factory) => {
  if (!import.meta.hot) return factory();
  if (__lithentRenderDisposers.has(id)) return __lithentRenderDisposers.get(id);
  const result = factory();
  if (typeof result === 'function') {
    __lithentRenderDisposers.set(id, result);
  }
  return result;
};
const __lithentResetInvalidateCount = (name = '') => {
  __lithentGlobalStore[__lithentInvalidateCountKey + '#' + name] = 0;
};
const __lithentSafeInvalidate = (reason, name = '') => {
  const key = __lithentInvalidateCountKey + '#' + name;
  const count = (__lithentGlobalStore[key] || 0) + 1;
  __lithentGlobalStore[key] = count;
  if (count >= 3) {
    console.warn('[Lithent HMR] boundary update repeatedly failed; reload manually:', reason);
    return;
  }
  console.warn('[Lithent HMR] invalidating boundary:', reason);
  import.meta.hot?.invalidate(reason);
};
const __lithentWrapComponent = (name, implementation) => {
  // Production/SSR builds retain the original component and never register hooks.
  if (!import.meta.hot) return implementation;
  let entry = __lithentModuleHotStore[name];
  if (!entry) {
    entry = {
      implementation,
      registrations: new WeakMap(),
      boundary: __lithentCreateBoundary(
        __lithentModuleId + '#' + name,
        reason => __lithentSafeInvalidate(reason, name),
        () => __lithentResetInvalidateCount(name)
      ),
    };
    entry.component = (props, children) => {
      const compKey = __lithentGetComponentKey();
      const instance = compKey && __lithentComponentMap.get(compKey);
      if (instance && entry.registrations.get(compKey) !== instance) {
        entry.registrations.set(compKey, instance);
        // Direct calls rerender the caller's existing closure; they have no
        // independent VDOM that can be replaced with this component's tag.
        const callerCtor = instance.ctor && instance.ctor !== entry.component
          ? instance.ctor : undefined;
        const unregister = entry.boundary.register(compKey, callerCtor);
        __lithentMountCallback(() => () => {
          if (entry.registrations.get(compKey) === instance) {
            entry.registrations.delete(compKey);
          }
          unregister();
        });
      }
      const implementation = entry.implementation;
      return implementation(props, children);
    };
    __lithentModuleHotStore[name] = entry;
  }
  entry.implementation = implementation;
  __lithentCurrentComponents[name] = entry;
  return entry.component;
};
const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) return;
  // Entries without components must propagate to importers, not accept an update
  // that cannot render anything (e.g. the render-only application entry).
  if (${JSON.stringify(componentNames)}.length) {
    import.meta.hot.accept(mod => {
      const current = __lithentHotData.currentComponents || {};
      const missing = ${JSON.stringify(componentNames)}.filter(name => !current[name]);
      if (!mod || missing.length) {
        import.meta.hot.invalidate('removed or unavailable components: ' + missing.join(', '));
        return;
      }
      const previousExports = __lithentExportSnapshot;
      if (!previousExports || Object.keys(previousExports).length !== Object.keys(mod).length
        || Object.keys(previousExports).some(name => !Object.prototype.hasOwnProperty.call(mod, name)
          || !Object.is(previousExports[name], mod[name]))) {
        import.meta.hot.invalidate('module exports changed');
        return;
      }
      for (const name of Object.keys(current)) {
        const entry = current[name];
        // Existing imports and future parent redraws keep the stable proxy.
        if (!entry.boundary.update(entry.component)) {
          __lithentResetInvalidateCount(name);
        }
      }
      // An unmounted component is a valid update: its proxy is already refreshed.
      __lithentResetInvalidateCount();
    });
  }
  import.meta.hot.dispose(data => {
    data.components = __lithentModuleHotStore;
    data.currentComponents = undefined;
    data.renderDisposers = __lithentRenderDisposers;
    // Keep the failure count across invalidation-driven module replacements.
  });
  import.meta.hot.prune(() => {
    // App disposers need the live component map to locate the current root.
    for (const dispose of __lithentRenderDisposers.values()) dispose();
    __lithentRenderDisposers.clear();
    for (const [name, entry] of Object.entries(__lithentModuleHotStore)) {
      entry.boundary.dispose();
      __lithentResetInvalidateCount(name);
    }
    __lithentResetInvalidateCount();
  });
};
__lithentSetupHmrHooks();
`;
};
