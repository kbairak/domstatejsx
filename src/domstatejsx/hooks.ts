import { getRef } from './context.js';
import type { RefObject } from './jsx-types';

// Hook return type - getter and setter
type Hook<T> = [() => T, (value: T | ((prev: T) => T)) => void];

export function* useRefs(): Generator<RefObject> {
  for (;;) yield {};
}

export function useRefProxy(): Record<string, RefObject> {
  return new Proxy(
    {} as Record<string, RefObject>,
    {
      get(target, prop: string) {
        if (!(prop in target)) target[prop] = {};
        return target[prop];
      },
    },
  );
}

export function combineHooks<T>(...hooks: Hook<T>[]): Hook<T> {
  const [get] = hooks[0];

  function set(valueOrFunc: T | ((prev: T) => T)): void {
    hooks.forEach(([, innerSet]) => innerSet(valueOrFunc));
  }

  return [get, set];
}

function acceptsFunc<T>(
  set: (value: T) => void,
  get: () => T,
): (valueOrFunc: T | ((prev: T) => T)) => void {
  return function (valueOrFunc: T | ((prev: T) => T)) {
    const value =
      valueOrFunc instanceof Function ? valueOrFunc(get()) : valueOrFunc;
    set(value);
  };
}

export function useTextContent(ref: RefObject<HTMLElement>): Hook<string> {
  function get(): string {
    return ref.current!.textContent || '';
  }

  function set(value: string): void {
    ref.current!.textContent = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useIntContent(ref: RefObject<HTMLElement>): Hook<number> {
  function get(): number {
    return parseInt(ref.current!.textContent || '0');
  }

  function set(value: number): void {
    ref.current!.textContent = `${value}`;
  }

  return [get, acceptsFunc(set, get)];
}

export function useStyleBoolean(
  ref: RefObject<HTMLElement>,
  property: string,
  onValue: string | null,
  offValue: string | null,
): Hook<boolean> {
  function get(): boolean {
    return ref.current!.style.getPropertyValue(property) === onValue;
  }

  function set(value: boolean): void {
    if (value) {
      if (onValue) {
        ref.current!.style.setProperty(property, onValue);
      } else {
        ref.current!.style.removeProperty(property);
      }
    } else {
      if (offValue) {
        ref.current!.style.setProperty(property, offValue);
      } else {
        ref.current!.style.removeProperty(property);
      }
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useCheckbox(
  ref: RefObject<HTMLInputElement>,
): Hook<boolean> {
  function get(): boolean {
    return ref.current!.checked;
  }

  function set(value: boolean): void {
    ref.current!.checked = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useTextInput(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement>,
): Hook<string> {
  function get(): string {
    return ref.current!.value;
  }

  function set(value: string): void {
    ref.current!.value = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useNumberInput(
  ref: RefObject<HTMLInputElement>,
): Hook<number> {
  function get(): number {
    return parseInt(ref.current!.value, 10);
  }

  function set(value: number): void {
    ref.current!.value = `${value}`;
  }

  return [get, acceptsFunc(set, get)];
}

export function usePropertyBoolean<T = any>(
  ref: RefObject<any>,
  property: string,
  onValue: T | null,
  offValue: T | null,
): Hook<T> {
  function get(): T {
    return ref.current![property];
  }

  function set(value: boolean): void {
    if (value) {
      if (onValue !== null) {
        ref.current![property] = onValue;
      } else {
        delete ref.current![property];
      }
    } else {
      if (offValue !== null) {
        ref.current![property] = offValue;
      } else {
        delete ref.current![property];
      }
    }
  }

  return [get, acceptsFunc(set as any, get)];
}

export function useErrorMessage(
  ref: RefObject<HTMLElement>,
): Hook<string | null> {
  function get(): string | null {
    if (ref.current!.style.getPropertyValue('display') === 'none') {
      return null;
    } else {
      return ref.current!.textContent;
    }
  }

  function set(value: string | null): void {
    if (!value) {
      ref.current!.textContent = '';
      ref.current!.style.setProperty('display', 'none');
    } else {
      ref.current!.textContent = value;
      ref.current!.style.removeProperty('display');
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useClassBoolean(
  ref: RefObject<HTMLElement>,
  onValue: string | string[] | null,
  offValue: string | string[] | null,
): Hook<boolean> {
  let onClasses: string[] = onValue === null ? [] : Array.isArray(onValue) ? onValue : [onValue];
  let offClasses: string[] = offValue === null ? [] : Array.isArray(offValue) ? offValue : [offValue];

  function get(): boolean {
    return onClasses.every((className) =>
      ref.current!.classList.contains(className),
    );
  }

  function set(value: boolean): void {
    if (value) {
      ref.current!.classList.remove(...offClasses);
      ref.current!.classList.add(...onClasses);
    } else {
      ref.current!.classList.remove(...onClasses);
      ref.current!.classList.add(...offClasses);
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useList<T = any>(
  ref: RefObject<HTMLElement>,
  getComponent: (arg: T) => Node,
): [() => RefObject[], (...args: T[]) => void, (...args: T[]) => void] {
  const refs: RefObject[] = [];

  function get(): RefObject[] {
    return refs;
  }

  function add(...args: T[]): void {
    ref.current!.append(
      ...args.map((arg) => {
        const node = getComponent(arg);
        refs.push(getRef(node));
        return node;
      }),
    );
  }

  function reset(...args: T[]): void {
    refs.forEach(({ current }) => (current as HTMLElement).remove());
    refs.splice(0, refs.length);
    add(...args);
  }

  setTimeout(() => {
    new MutationObserver(() =>
      refs.splice(0, refs.length, ...[...ref.current!.childNodes].map(getRef)),
    ).observe(ref.current!, { childList: true });
    ref.current!.childNodes.forEach((node) => refs.push(getRef(node)));
  }, 0);

  return [get, add, reset];
}

export function useControlledInput<T = any>(
  ref: RefObject & { context?: { get: () => T; set: (value: T) => void } },
): Hook<T> {
  function get(): T {
    return ref.context!.get();
  }

  function set(value: T): void {
    return ref.context!.set(value);
  }

  return [get, acceptsFunc(set, get)];
}

export function useLocalStorage(key: string): Hook<string | null> {
  function get(): string | null {
    return localStorage.getItem(key);
  }

  function set(value: string | null): void {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  return [get, acceptsFunc(set, get)];
}
