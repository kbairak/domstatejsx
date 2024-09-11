import { isEqual } from 'lodash';
import { createContext, findUp, useContext } from './context';
import { useRefs } from './hooks';

function convertToPattern(path) {
  // /a/:b/c/:d => ^/a/(?<b>[^/]+)/c/(?<d>[^/]+)
  return (
    '^' + path.replaceAll(/:[^\/]+/g, (m) => `(?<${m.substring(1)}>[^/]+)`)
  );
}

export function Route({ path = '', end = false, NotFound, render }) {
  const [head] = useRefs();

  setTimeout(() => {
    if (
      head.current.parentElement &&
      !useContext(head.current, Route.Context)
    ) {
      // If I am the top Route, draw myself
      draw(location.pathname);
      // When the browser back/forward button is clicked, draw myself with the new path
      window.addEventListener('popstate', () => {
        const pattern = new RegExp(convertToPattern(path) + (end ? '$' : ''));
        const match = pattern.exec(location.pathname);
        if (match) {
          draw(location.pathname, match.groups || {});
        } else {
          renderNotFound();
        }
      });
    }
  }, 0);

  let lastProps = undefined;
  function draw(pathname, props = {}) {
    // The powers that be decided that this I should draw myself
    if (head.current.childElementCount === 0 || !isEqual(lastProps, props)) {
      head.current.replaceChildren(render(props));
    }

    // Lets see if any of my children should draw themselves
    let found = false;
    useContext(head.current, Route.Context, { direction: 'down' }).forEach(
      ({
        path: childPath,
        end: childEnd,
        draw: childDraw,
        clear: childClear,
        isDirectChildOf: childIsDirectChildOf,
      }) => {
        if (!childIsDirectChildOf(head.current)) {
          return;
        }
        const pattern = new RegExp(
          convertToPattern(childPath) + (childEnd ? '$' : ''),
        );
        const match = pattern.exec(pathname);
        if (match) {
          childDraw(pathname.substring(match[0].length), match.groups || {});
          found = true;
        } else {
          childClear();
        }
      },
    );
    lastProps = props;
    if (!found && pathname) {
      renderNotFound();
    }
  }

  function renderNotFound() {
    if (NotFound) {
      head.current.replaceChildren(<NotFound />);
    } else {
      useContext(head.current, Route.Context).renderNotFound();
    }
  }

  function navigate(to, { initial }) {
    const myPath = getPath();
    const match = new RegExp(convertToPattern(myPath)).exec(to);
    if (match) {
      draw(to.substring(match[0].length), match.groups || {});
    } else {
      useContext(head.current, Route.Context).navigate(to, { initial: false });
    }
    if (initial) {
      history.pushState({}, '', to);
    }
  }

  function getPath() {
    const parent = useContext(head.current, Route.Context);
    return parent ? parent.getPath() + path : path;
  }

  function clear() {
    useContext(head.current, Link.Context, { direction: 'down' }).forEach(
      ({ removePopstateListener }) => removePopstateListener(),
    );
    head.current.innerHTML = '';
  }

  function isDirectChildOf(parent) {
    return findUp(head.current, Route.Context) === parent;
  }

  return (
    <Route.Context.Provider
      value={{
        path,
        end,
        draw,
        clear,
        renderNotFound,
        navigate,
        getPath,
        isDirectChildOf,
      }}
      ref={head}
    >
      <div />
    </Route.Context.Provider>
  );
}
Route.Context = createContext();

export function Link({ to, render = null, children }) {
  const [head] = useRefs();

  function onClick(event) {
    if (to !== location.pathname) {
      useContext(event.target, Route.Context).navigate(to, { initial: true });
      useContext(document.body, Link.Context, { direction: 'down' }).forEach(
        ({ rerender }) => rerender(),
      );
    }
  }

  function isActive() {
    return location.pathname === to;
  }

  function rerender() {
    if (render === null) {
      return;
    }
    const newHead = (
      <Link.Context.Provider value={{ rerender, removePopstateListener }}>
        {render({ onClick, isActive })}
      </Link.Context.Provider>
    );
    head.current.replaceWith(newHead);
    head.current = newHead;
  }

  if (render !== null) {
    window.addEventListener('popstate', rerender);
  }

  function removePopstateListener() {
    window.removeEventListener('popstate', rerender);
  }

  return (
    <Link.Context.Provider
      value={{ rerender, removePopstateListener }}
      ref={head}
    >
      {render === null && <button onClick={onClick}>{children}</button>}
      {render !== null && render({ onClick, isActive })}
    </Link.Context.Provider>
  );
}
Link.Context = createContext();
