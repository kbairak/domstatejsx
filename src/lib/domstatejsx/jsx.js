import {
  jsx as jsxDomJsx,
  createElement as jsxDomCreateElement,
} from 'jsx-dom';
import { getRef } from './context';

function wrap(func) {
  return function wrapped(tag, props, ...args) {
    const ref = 'ref' in (props || {}) && props.ref;
    delete (props || {}).ref;

    const current = func(tag, props, ...args);

    if (ref) {
      const result = getRef(current);
      if (ref instanceof Function) {
        ref(result);
      } else {
        Object.assign(ref, result);
      }
    }

    return current;
  };
}

export const jsx = wrap(jsxDomJsx);
export const createElement = wrap(jsxDomCreateElement);
