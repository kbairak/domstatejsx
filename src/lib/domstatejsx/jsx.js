import { jsx as jsxDomJsx, createElement as jsxDomCreateElement } from 'jsx-dom';

export function jsx(tag, { children, ...props }, _key) {
    const ref = 'ref' in (props || {}) && props.ref;
    delete (props || {}).ref;

    const result = jsxDomJsx(tag, { children, ...props }, _key);

    if (ref) ref.current = result;

    return result;
}

export function createElement(tag, props, ...children) {
    const ref = 'ref' in (props || {}) && props.ref;
    delete (props || {}).ref;

    const result = jsxDomCreateElement(tag, props, ...children);

    if (ref) ref.current = result;

    return result;
}
