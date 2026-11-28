// No inline script is allowed on this page, so the steps live here.
window.cspResult = null;
lithentLive
  .mountLive({
    code: 'return lmount(() => () => fTags.p({}, "never shown"))',
    container: document.getElementById('widget'),
    runtimeUrl: '/live/dist/sandboxRuntime.umd.js',
    timeoutMs: 1500,
  })
  .then(
    () => (window.cspResult = { started: true }),
    error => (window.cspResult = { started: false, error: error })
  )
  .then(() => {
    window.cspResult.iframes = document.querySelectorAll('iframe').length;
    document.documentElement.dataset.ready = 'true';
  });
