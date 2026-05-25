import type { ComponentChildren, JSXElement, RefObject } from './jsx-types';
import { v4 as uuid4 } from 'uuid';

const EXPOSE: Record<string, any> = {};

type ProviderProps = {
  value: any;
  children?: ComponentChildren;
  ref?: any;
  [key: string]: any;
};

class Context<T = any> {
  datasetKey: string;
  defaultValue: T | undefined;

  constructor(defaultValue?: T) {
    this.datasetKey = 'context' + uuid4().replace(/-/g, '');
    this.defaultValue = defaultValue;
  }

  Provider = ({ value, children }: ProviderProps): JSXElement => {
    // Create wrapper element directly to avoid circular dependency with jsx
    let node: JSXElement;
    if (children === undefined) {
      node = document.createElement('span');
    } else if (children instanceof Array) {
      const span = document.createElement('span');
      children.forEach((child) => {
        if (child instanceof Node) {
          span.appendChild(child);
        } else if (child != null && typeof child !== 'boolean') {
          span.appendChild(document.createTextNode(String(child)));
        }
      });
      node = span;
    } else if (children instanceof DocumentFragment) {
      const span = document.createElement('span');
      span.appendChild(children);
      node = span;
    } else {
      node = children as JSXElement;
    }

    const providerUuid = uuid4();
    const element = node as HTMLElement;
    element.dataset[this.datasetKey] = providerUuid;
    EXPOSE[providerUuid] = value || this.defaultValue;

    setTimeout(() => {
      new MutationObserver((records, observer) => {
        if (
          records.find((record) =>
            [...record.removedNodes].find((n) => n === node),
          ) &&
          !records.find((record) =>
            [...record.addedNodes].find((n) => n === node),
          )
        ) {
          delete EXPOSE[providerUuid];
          observer.disconnect();
        }
      }).observe(element.parentElement || document.body, {
        childList: true,
      });
    }, 0);

    return node;
  };
}

export function createContext<T = any>(defaultValue?: T): Context<T> {
  return new Context<T>(defaultValue);
}

export function findUp(
  node: HTMLElement,
  context: Context,
): HTMLElement | undefined {
  let currentNode: HTMLElement | null = node.parentElement;
  while (currentNode) {
    if (context.datasetKey in currentNode.dataset) return currentNode;
    currentNode = currentNode.parentElement;
  }
  return undefined;
}

function findDown(node: HTMLElement, context: Context): HTMLElement[] {
  return [...node.querySelectorAll(`[data-${context.datasetKey}]`)] as HTMLElement[];
}

type UseContextOptions = {
  direction?: 'up' | 'down' | 'side';
  upContext?: Context;
};

export function useContext<T = any>(
  node: HTMLElement,
  context: Context<T>,
  options: UseContextOptions = {},
): T | T[] | undefined {
  const { direction = 'up', upContext = null } = options;

  if (direction === 'up') {
    const parent = findUp(node, context);
    if (parent) {
      const key = parent.dataset[context.datasetKey];
      return key ? (EXPOSE[key] as T) : undefined;
    }
    return undefined;
  } else if (direction === 'down') {
    return findDown(node, context).map((element) => {
      const key = element.dataset[context.datasetKey];
      return key ? (EXPOSE[key] as T) : undefined;
    }).filter((v): v is T => v !== undefined);
  } else if (direction === 'side' && upContext) {
    const upNode = findUp(node, upContext) || (document.body as HTMLElement);
    return useContext(upNode, context, { direction: 'down' });
  }
  return undefined;
}

export function getRef(current: JSXElement): RefObject {
  const result: RefObject = { current };
  const element = current as HTMLElement;
  if (element.dataset) {
    const contexts = Object.entries(element.dataset).filter(
      ([key]) => key.length === 39 && key.startsWith('context'),
    );
    if (contexts.length) {
      result.context = Object.assign(
        {},
        ...contexts
          .map(([, providerUuid]) => providerUuid)
          .filter((uuid): uuid is string => uuid !== undefined)
          .map((uuid) => EXPOSE[uuid] || {}),
      );
    }
  }
  return result;
}
