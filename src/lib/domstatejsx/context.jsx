const EXPOSE = {};

class Context {
  constructor(defaultValue) {
    this.datasetKey = 'a' + crypto.randomUUID().replaceAll('-', '');
    this.defaultValue = defaultValue;
    this.Provider = this.Provider.bind(this);
  }

  Provider({ value, children }) {
    let node;
    if (children === undefined) {
      node = <div />;
    } else if (children instanceof Array) {
      node = <div>{children}</div>;
    } else {
      node = children;
    }
    const providerUuid = crypto.randomUUID();
    node.dataset[this.datasetKey] = providerUuid;
    EXPOSE[providerUuid] = value || this.defaultValue;
    setTimeout(() => {
      new MutationObserver((records, observer) => {
        if (records.find((record) => [...record.removedNodes].find((n) => n === node))) {
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

function findUp(node, context) {
  let currentNode = node;
  while (currentNode) {
    if (context.datasetKey in currentNode.dataset) return currentNode;
    currentNode = currentNode.parentElement;
  }

}

function findDown(node, context) {
  const result = [];
  if (context.datasetKey in node.dataset) result.push(node);
  const query = `[data-${context.datasetKey}]`;
  result.push(...[...node.querySelectorAll(query)]);
  return result;
}

export function useContext(node, context, { direction = 'up', upContext = null } = {}) {
  if (direction === 'up') {
    return EXPOSE[findUp(node, context).dataset[context.datasetKey]];
  } else if (direction === 'down') {
    return findDown(node, context)
      .map((element) => EXPOSE[element.dataset[context.datasetKey]]);
  } else if (direction === 'side') {
    const upNode = findUp(node, upContext);
    return useContext(upNode, context, { direction: 'down' });
  }
}
