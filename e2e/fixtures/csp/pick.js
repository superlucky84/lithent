const core = new URLSearchParams(location.search).get('core');
window.baseCore = window.lithent;
window.lithent =
  core === 'concurrent' ? window.lithentConcurrent : window.baseCore;
window.core = window.lithent;
