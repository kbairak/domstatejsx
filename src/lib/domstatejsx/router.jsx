import { createContext, findUp, useContext } from './context';
import { isEqual } from 'lodash';
import { useRefs } from './hooks';

function convertToPattern(path) {
  return '^' + path.replaceAll(/:[^\/]+/g, (m) => `(?<${m.substring(1)}>[^/]+)`);
}

export function Route({ path, end, NotFound, element, children }) {
  console.log(path, 'called');
  const [head] = useRefs();
  const Component = children || element;

  setTimeout(() => {
    console.log(path, 'defer');
    if (head.current.parentElement && !useContext(head.current, Route.Context)) {
      console.log(path, 'I am (g)root');
      // If I am the top Route
      render(location.pathname);
      window.addEventListener('popstate', () => render(location.pathname));
    }
  }, 0);

  let lastProps = undefined;
  function render(pathname, props = {}) {
    console.log(path, 'render');
    if (isEmpty() || !isEqual(lastProps, props)) {
      head.current.replaceChildren(<Component {...props} />);
    }
    let found = false;
    useContext(head.current, Route.Context, { direction: 'down' })
      .forEach(({
        path: childPath,
        end: childEnd,
        render: childRender,
        clear: childClear,
        isDirectChildOf: childIsDirectChildOf,
      }) => {
        if (!childIsDirectChildOf(head.current)) return;
        const pattern = new RegExp(convertToPattern(childPath) + (childEnd ? '$' : ''));
        const match = pattern.exec(pathname);
        if (match) {
          childRender(pathname.substring(match[0].length), match.groups || {});
          found = true;
        } else {
          childClear();
        }
      });
    lastProps = props;
    if (!found && pathname) {
      renderNotFound();
    }
  }

  function renderNotFound() {
    console.log(path, 'renderNotFound');
    if (NotFound) {
      head.current.replaceChildren(<NotFound />);
    } else {
      useContext(head.current, Route.Context).renderNotFound();
    }
  }

  function navigate(to, { initial }) {
    const myPath = getPath();
    if (to === myPath) return;
    const match = (new RegExp(convertToPattern(myPath))).exec(to);
    if (match) {
      render(to.substring(match[0].length), match.groups || {});
    } else {
      useContext(head.current, Route.Context).navigate(to, { initial: false });
    }
    if (initial) history.pushState({}, "", to);
  }

  function getPath() {
    const parent = useContext(head.current, Route.Context);
    return parent ? parent.getPath() + path : path;
  }

  function isEmpty() {
    return head.current.childElementCount === 0;
  }

  function clear() {
    head.current.innerHTML = '';
  }

  function isDirectChildOf(parent) {
    return findUp(head.current, Route.Context) === parent;
  }

  return (
    <Route.Context.Provider
      value={{
        path, end, render, clear, renderNotFound, navigate, getPath, isDirectChildOf
      }}
      ref={head}
    >
      <div />
    </Route.Context.Provider>
  );
}
Route.Context = createContext();

export function Link({ to, children }) {
  return (
    <button
      onClick={
        (event) => {
          useContext(event.target, Route.Context).navigate(to, { initial: true });
        }
      }
    >
      {children}
    </button>
  );
}
