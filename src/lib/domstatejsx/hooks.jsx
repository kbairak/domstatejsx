import { getRef } from './context';

export function* useRefs() {
  for (;;) yield {};
}

export function useRefProxy() {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (!(prop in target)) target[prop] = {};
        return target[prop];
      },
    },
  );
}

export function combineHooks(...hooks) {
  const [get] = hooks[0];

  function set(...args) {
    hooks.forEach(([, innerSet]) => innerSet(...args));
  }

  return [get, set];
}

function acceptsFunc(set, get) {
  return function (valueOrFunc) {
    const value =
      valueOrFunc instanceof Function ? valueOrFunc(get()) : valueOrFunc;
    set(value);
  };
}

export function useTextContent(ref) {
  function get() {
    return ref.current.textContent;
  }

  function set(value) {
    ref.current.textContent = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useIntContent(ref) {
  function get() {
    return parseInt(ref.current.textContent);
  }

  function set(value) {
    ref.current.textContent = `${value}`;
  }

  return [get, acceptsFunc(set, get)];
}

export function useStyleBoolean(ref, property, onValue, offValue) {
  function get() {
    return ref.current.style.getPropertyValue(property) === onValue;
  }

  function set(value) {
    if (value) {
      if (onValue) {
        ref.current.style.setProperty(property, onValue);
      } else {
        ref.current.style.removeProperty(property);
      }
    } else {
      if (offValue) {
        ref.current.style.setProperty(property, offValue);
      } else {
        ref.current.style.removeProperty(property);
      }
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useCheckbox(ref) {
  function get() {
    return ref.current.checked;
  }

  function set(value) {
    ref.current.checked = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useTextInput(ref) {
  function get() {
    return ref.current.value;
  }

  function set(value) {
    ref.current.value = value;
  }

  return [get, acceptsFunc(set, get)];
}

export function useNumberInput(ref) {
  function get() {
    return parseInt(ref.current.value, 10);
  }

  function set(value) {
    ref.current.value = `${value}`;
  }

  return [get, acceptsFunc(set, get)];
}

export function usePropertyBoolean(ref, property, onValue, offValue) {
  function get() {
    return ref.current[property];
  }

  function set(value) {
    if (value) {
      if (onValue !== null) {
        ref.current[property] = onValue;
      } else {
        delete ref.current[property];
      }
    } else {
      if (offValue !== null) {
        ref.current[property] = offValue;
      } else {
        delete ref.current[property];
      }
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useErrorMessage(ref) {
  function get() {
    if (ref.current.style.getPropertyValue('display') === 'none') {
      return null;
    } else {
      return ref.current.textContent;
    }
  }

  function set(value) {
    if (!value) {
      ref.current.textContent = '';
      ref.current.style.setProperty('display', 'none');
    } else {
      ref.current.textContent = value;
      ref.current.style.removeProperty('display');
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useClassBoolean(ref, onValue, offValue) {
  if (onValue === null) onValue = [];
  else if (!Array.isArray(onValue)) onValue = [onValue];
  if (offValue === null) offValue = [];
  else if (!Array.isArray(offValue)) offValue = [offValue];

  function get() {
    return onValue.every((className) =>
      ref.current.classList.contains(className),
    );
  }

  function set(value) {
    if (value) {
      ref.current.classList.remove(...offValue);
      ref.current.classList.add(...onValue);
    } else {
      ref.current.classList.remove(...onValue);
      ref.current.classList.add(...offValue);
    }
  }

  return [get, acceptsFunc(set, get)];
}

export function useList(ref, getComponent) {
  const refs = [];

  function get() {
    return refs;
  }

  function add(...args) {
    ref.current.append(
      ...args.map((arg) => {
        const node = getComponent(arg);
        refs.push(getRef(node));
        return node;
      }),
    );
  }

  function reset(...args) {
    refs.forEach(({ current }) => current.remove());
    refs.splice(0, refs.length);
    add(...args);
  }

  setTimeout(() => {
    new MutationObserver(() => {
      refs.splice(0, refs.length, ...[...ref.current.childNodes].map(getRef));
    }).observe(ref.current, { childList: true });
    ref.current.childNodes.forEach((node) => refs.push(getRef(node)));
  }, 0);

  return [get, add, reset];
}

export function useControlledInput(ref) {
  function get() {
    return ref.context.get();
  }

  function set(value) {
    return ref.context.set(value);
  }

  return [get, acceptsFunc(set, get)];
}
