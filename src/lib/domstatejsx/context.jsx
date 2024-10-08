const EXPOSE = {};

class Context {
  constructor(defaultValue) {
    this.datasetKey = 'context' + crypto.randomUUID().replaceAll('-', '');
    this.defaultValue = defaultValue;
    this.Provider = this.Provider.bind(this);
  }

  Provider({ value, children }) {
    let node;
    if (children === undefined) {
      node = <span />;
    } else if (
      children instanceof Array ||
      children instanceof DocumentFragment
    ) {
      node = <span>{children}</span>;
    } else {
      node = children;
    }
    const providerUuid = crypto.randomUUID();
    node.dataset[this.datasetKey] = providerUuid;
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
      }).observe(node.parentElement || document.body, { childList: true });
    }, 0);
    return node;
  }
}

export function createContext(defaultValue) {
  return new Context(defaultValue);
}

export function findUp(node, context) {
  let currentNode = node.parentElement;
  while (currentNode) {
    if (context.datasetKey in currentNode.dataset) return currentNode;
    currentNode = currentNode.parentElement;
  }
}

function findDown(node, context) {
  return [...node.querySelectorAll(`[data-${context.datasetKey}]`)];
}

export function useContext(
  node,
  context,
  { direction = 'up', upContext = null } = {},
) {
  if (direction === 'up') {
    const parent = findUp(node, context);
    if (parent) {
      return EXPOSE[parent.dataset[context.datasetKey]];
    }
  } else if (direction === 'down') {
    return findDown(node, context).map(
      (element) => EXPOSE[element.dataset[context.datasetKey]],
    );
  } else if (direction === 'side') {
    const upNode = findUp(node, upContext) || document.body;
    return useContext(upNode, context, { direction: 'down' });
  }
}

export function getRef(current) {
  const result = { current };
  const contexts = Object.entries(current.dataset || {}).filter(
    ([key]) => key.length === 39 && key.startsWith('context'),
  );
  if (contexts.length) {
    result.context = Object.assign(
      ...contexts.map(([, providerUuid]) => EXPOSE[providerUuid] || {}),
    );
  }
  return result;
}
