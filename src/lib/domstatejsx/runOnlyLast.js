let timerId = null;

export function runOnlyLast(fn) {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    fn();
    timerId = null;
  }, 0);
}
