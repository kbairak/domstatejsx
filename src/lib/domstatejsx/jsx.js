import {
  jsx as jsxDomJsx,
  createElement as jsxDomCreateElement,
} from 'jsx-dom';
import { EXPOSE } from './context';

function wrap(func) {
  return function wrapped(tag, props, ...args) {
    const ref = 'ref' in (props || {}) && props.ref;
    delete (props || {}).ref;

    const current = func(tag, props, ...args);

    if (ref) {
      const result = { current };
      const found = Object.entries(current.dataset || {}).find(
        ([key]) => key.length === 39 && key.startsWith('context'),
      );
      if (found) {
        const [, providerUuid] = found;
        if (providerUuid in EXPOSE) {
          result.context = EXPOSE[providerUuid];
        }
      }
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
