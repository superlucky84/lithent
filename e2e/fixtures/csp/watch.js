// First script on the page: every policy violation after this is recorded.
window.violations = [];
document.addEventListener('securitypolicyviolation', event => {
  window.violations.push(`${event.violatedDirective} ${event.blockedURI}`);
});
