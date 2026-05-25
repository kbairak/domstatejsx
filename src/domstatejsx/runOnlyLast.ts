let timerId: ReturnType<typeof setTimeout> | null = null;

export function runOnlyLast(fn: () => void): void {
  clearTimeout(timerId!);
  timerId = setTimeout(() => {
    fn();
    timerId = null;
  }, 0);
}
