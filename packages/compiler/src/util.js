export function makeCursor(code, ignoreStr = [], ignoreChk = []) {
  return { ignoreStr, ignoreChk, start: 0, end: 0, code };
}
