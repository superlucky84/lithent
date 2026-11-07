let current = '외부 알림 대기';
export const readStatus = () => current;
export const emitStatus = (message: string) => {
  current = message;
  window.dispatchEvent(
    new CustomEvent('closure-demo-status', { detail: message })
  );
};
