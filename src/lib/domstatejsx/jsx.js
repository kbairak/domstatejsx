import { jsx as jsxDomJsx, createElement as jsxDomCreateElement } from 'jsx-dom';
import { EXPOSE } from './context';

function wrap(func) {
  function wrapped(tag, props, ...args) {
    const ref = 'ref' in (props || {}) && props.ref;
    delete (props || {}).ref;

    const result = func(tag, props, ...args);

    if (ref) {
      ref.current = result;
      const found = Object
        .entries(result.dataset || {})
        .find(([key]) => key.length === 39 && key.startsWith('context'));
      if (found) {
        const [, providerUuid] = found;
        if (providerUuid in EXPOSE) {
          ref.context = EXPOSE[providerUuid];
        }
      }
    }

    return result;
  }
  return wrapped;
}

export const jsx = wrap(jsxDomJsx);
export const createElement = wrap(jsxDomCreateElement);
