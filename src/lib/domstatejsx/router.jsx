import { createContext, useContext } from './context';
import { useRefs } from './hooks';

function convertToPattern(path) {
  return '^' + path.replaceAll(/:[^\/]+/g, (m) => `(?<${m.substring(1)}>[^/]+)`);
}

function findRoute(ref, pathname) {
  let match;
  const route = useContext(ref.current, Route.Context, { direction: 'down' })
    .find(({ path, end }) => {
      const pattern = new RegExp(convertToPattern(path) + (end ? '$' : ''));
      match = pattern.exec(pathname);
      if (!match) return false;
      return true;
    });
  return [route, match?.groups || {}];
}

export function Router({ NotFound, children }) {
  const [head] = useRefs();

  function render(pathname) {
    const [route, props] = findRoute(head, pathname);
    if (route) {
      route.render(pathname.substring(route.path.length), props);
    } else {
      renderNotFound();
    }
  }

  setTimeout(() => render(location.pathname), 0);

  function renderNotFound() {
    head.current.replaceChildren(<NotFound />);
  }

  window.addEventListener('popstate', () => render(location.pathname));

  return (
    <Router.Context.Provider value={{ renderNotFound }} ref={head}>
      {children}
    </Router.Context.Provider>
  );
}
Router.Context = createContext();

export function Route({ path, end = false, element, children }) {
  const [head] = useRefs();

  const component = children || element;

  function render(pathname, receivedProps) {
    // TODO:
    //   - If route is different than the old one, clear the old one and render
    //     the new one
    //   - else, if props are different, rerender the old one
    //   - else, do nothing
    head.current.replaceChildren(component(receivedProps));
    if (!pathname) return;
    const [route, props] = findRoute(head, pathname);
    if (route) {
      route.render(pathname.substring(route.path.length), props);
    } else {
      useContext(head.current, Router.Context).renderNotFound();
    }
  }

  function getPath() {
    const parent = useContext(head.current, Route.Context);
    return parent ? parent.getPath() + path : path;
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

  return (
    <div>
      <Route.Context.Provider
        value={{ path, end, render, getPath, navigate }}
        ref={head}
      />
    </div>
  );
}
Route.Context = createContext();

export function Link({ to, children }) {
  return (
    <button
      onClick={
        (event) => useContext(event.target, Route.Context)
          .navigate(to, { initial: true })
      }
    >
      {children}
    </button>
  );
}
