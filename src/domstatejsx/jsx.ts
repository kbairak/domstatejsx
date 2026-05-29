import { getRef } from './context.js';
import type {
  ComponentChild,
  ComponentChildren,
  ComponentProps,
  FunctionComponent,
  JSXElement,
  Ref,
} from './jsx-types';

// Fragment symbol
export const Fragment = Symbol.for('domstatejsx.Fragment');

// Helper to process and append children to a parent node
function appendChildren(parent: Node, children: ComponentChildren): void {
  // Flatten and process children
  const processChild = (child: ComponentChildren): void => {
    // Skip null, undefined, true, false
    if (child == null || typeof child === 'boolean') {
      return;
    }

    // Handle arrays - recursively process each item
    if (Array.isArray(child)) {
      child.forEach(processChild);
      return;
    }

    // Handle strings and numbers - create text nodes
    if (typeof child === 'string' || typeof child === 'number') {
      const textNode = document.createTextNode(String(child));
      parent.appendChild(textNode);
      return;
    }

    // Handle DOM nodes and DocumentFragments
    if (child instanceof Node) {
      parent.appendChild(child);
      return;
    }
  };

  if (Array.isArray(children)) {
    children.forEach(processChild);
  } else if (children !== undefined) {
    processChild(children);
  }
}

// SVG elements that need special namespace handling
const SVG_TAGS = [
  'svg',
  'circle',
  'path',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
  'g',
  'text',
  'defs',
  'use',
  'clipPath',
  'mask',
  'pattern',
  'linearGradient',
  'radialGradient',
  'stop',
  'animate',
  'animateTransform',
  'animateMotion',
] as const;

// Core implementation that creates elements with children
function createElementCore<P extends ComponentProps>(
  tag: string | symbol | FunctionComponent<P>,
  props: (P & { ref?: Ref }) | null,
  children: ComponentChildren,
): JSXElement {
  // Extract and remove ref before processing
  const ref = props?.ref;
  if (ref && props) {
    delete props.ref;
  }

  // Handle Fragment
  if (tag === Fragment) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, children);
    return fragment;
  }

  // Handle component functions
  if (typeof tag === 'function') {
    const result = tag(props || ({} as P));
    // Apply ref to component result
    if (ref) {
      applyRef(ref, result);
    }
    return result;
  }

  // Create DOM element
  const element = SVG_TAGS.includes(tag as any)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag as string)
    : document.createElement(tag as string);

  // Apply props
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      // Skip special props
      if (key === 'key' || key === 'children') continue;

      // Handle event handlers (onClick, onChange, etc.)
      if (
        key.startsWith('on') &&
        key.length > 2 &&
        key[2] === key[2].toUpperCase()
      ) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
        continue;
      }

      // Handle className and class
      if (key === 'className' || key === 'class') {
        (element as HTMLElement).className = value as string;
        continue;
      }

      // Handle style
      if (key === 'style') {
        if (typeof value === 'string') {
          element.setAttribute('style', value);
        } else if (typeof value === 'object' && value !== null) {
          Object.assign(element.style, value);
        }
        continue;
      }

      // Handle boolean attributes and properties
      if (typeof value === 'boolean') {
        (element as any)[key] = value;
        if (value) {
          element.setAttribute(key, '');
        }
        continue;
      }

      // Handle standard attributes
      if (value != null) {
        element.setAttribute(key, String(value));
      }
    }
  }

  // Append children
  appendChildren(element, children);

  // Apply ref to element
  if (ref) {
    applyRef(ref, element);
  }

  return element;
}

// Helper to apply refs
function applyRef(ref: Ref, element: JSXElement): void {
  const result = getRef(element);
  if (ref instanceof Function) {
    ref(result);
  } else {
    Object.assign(ref, result);
  }
}

// jsx() for automatic JSX runtime - children in props.children
// Overload for intrinsic elements (HTML/SVG tags)
export function jsx<K extends keyof JSX.IntrinsicElements>(
  tag: K,
  props: (JSX.IntrinsicElements[K] & { ref?: Ref }) | null,
  _key?: string,
): JSXElement;
// Overload for Fragment
export function jsx(
  tag: typeof Fragment,
  props: ({ children?: ComponentChildren } & { ref?: Ref }) | null,
  _key?: string,
): JSXElement;
// Overload for component functions
export function jsx<P = {}>(
  tag: FunctionComponent<P>,
  props: (P & ComponentProps & { ref?: Ref }) | null,
  _key?: string,
): JSXElement;
// Implementation
export function jsx(
  tag: string | symbol | FunctionComponent<any>,
  props: any,
  _key?: string,
): JSXElement {
  return createElementCore(tag, props, props?.children);
}

// jsxs() - same as jsx() for arrays of children
export const jsxs = jsx;

// jsxDEV() - same as jsx() for development
export const jsxDEV = jsx;

// createElement() for classic JSX runtime - children as varargs
// Overload for intrinsic elements (HTML/SVG tags)
export function createElement<K extends keyof JSX.IntrinsicElements>(
  tag: K,
  props: (JSX.IntrinsicElements[K] & { ref?: Ref }) | null,
  ...children: ComponentChild[]
): JSXElement;
// Overload for Fragment
export function createElement(
  tag: typeof Fragment,
  props: ({ children?: ComponentChildren } & { ref?: Ref }) | null,
  ...children: ComponentChild[]
): JSXElement;
// Overload for component functions
export function createElement<P = {}>(
  tag: FunctionComponent<P>,
  props: (P & ComponentProps & { ref?: Ref }) | null,
  ...children: ComponentChild[]
): JSXElement;
// Implementation
export function createElement(
  tag: string | symbol | FunctionComponent<any>,
  props: any,
  ...children: ComponentChild[]
): JSXElement {
  // For components, merge varargs children into props
  if (typeof tag === 'function') {
    const componentProps = { ...props } as any;
    if (children.length > 0) {
      componentProps.children = children.length === 1 ? children[0] : children;
    }
    return createElementCore(tag, componentProps, componentProps.children);
  }

  return createElementCore(
    tag,
    props,
    children.length === 1 ? children[0] : children,
  );
}
