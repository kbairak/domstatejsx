import { isEqual } from 'lodash';
import { createContext, findUp, useContext } from './context.js';
import { useRefProxy } from './hooks.js';
import type { ComponentProps, FunctionComponent, JSXElement } from './jsx-types';

function convertToPattern(path: string): string {
  // /a/:b/c/:d => ^/a/(?<b>[^/]+)/c/(?<d>[^/]+)
  return (
    '^' + path.replace(/:[^\/]+/g, (m) => `(?<${m.substring(1)}>[^/]+)`)
  );
}

type RouteProps = ComponentProps & {
  path?: string;
  end?: boolean;
  NotFound?: FunctionComponent;
  render: FunctionComponent<any>;
};

type RouteContextValue = {
  path: string;
  end: boolean;
  draw: (pathname: string, props?: Record<string, any>) => void;
  clear: () => void;
  renderNotFound: () => void;
  navigate: (to: string, options: { initial: boolean }) => void;
  getPath: () => string;
  isDirectChildOf: (parent: HTMLElement) => boolean;
};

export function Route({ path = '', end = false, NotFound, render }: RouteProps): JSXElement {
  const refs = useRefProxy();

  setTimeout(() => {
    if (
      refs.head.current!.parentElement &&
      !useContext(refs.head.current as HTMLElement, Route.Context)
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

  let lastProps: Record<string, any> | undefined = undefined;
  function draw(pathname: string, props: Record<string, any> = {}): void {
    // The powers that be decided that this I should draw myself
    if (
      (refs.head.current as HTMLElement).childElementCount === 0 ||
      !isEqual(lastProps, props)
    ) {
      (refs.head.current as HTMLElement).replaceChildren(render(props));
    }

    // Lets see if any of my children should draw themselves
    let found = false;
    (useContext(refs.head.current as HTMLElement, Route.Context, { direction: 'down' }) as RouteContextValue[]).forEach(
      ({
        path: childPath,
        end: childEnd,
        draw: childDraw,
        clear: childClear,
        isDirectChildOf: childIsDirectChildOf,
      }) => {
        if (!childIsDirectChildOf(refs.head.current as HTMLElement)) {
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

  function renderNotFound(): void {
    if (NotFound) {
      (refs.head.current as HTMLElement).replaceChildren(<NotFound />);
    } else {
      (useContext(refs.head.current as HTMLElement, Route.Context) as RouteContextValue).renderNotFound();
    }
  }

  function navigate(to: string, { initial }: { initial: boolean }): void {
    const myPath = getPath();
    const match = new RegExp(convertToPattern(myPath)).exec(to);
    if (match) {
      draw(to.substring(match[0].length), match.groups || {});
    } else {
      (useContext(refs.head.current as HTMLElement, Route.Context) as RouteContextValue).navigate(to, {
        initial: false,
      });
    }
    if (initial) {
      history.pushState({}, '', to);
    }
  }

  function getPath(): string {
    const parent = useContext(refs.head.current as HTMLElement, Route.Context) as RouteContextValue | undefined;
    return parent ? parent.getPath() + path : path;
  }

  function clear(): void {
    (useContext(refs.head.current as HTMLElement, Link.Context, { direction: 'down' }) as LinkContextValue[]).forEach(
      ({ removePopstateListener }) => removePopstateListener(),
    );
    (refs.head.current as HTMLElement).innerHTML = '';
  }

  function isDirectChildOf(parent: HTMLElement): boolean {
    return findUp(refs.head.current as HTMLElement, Route.Context) === parent;
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
      ref={refs.head}
    >
      <div />
    </Route.Context.Provider>
  );
}
Route.Context = createContext<RouteContextValue>();

type LinkContextValue = {
  rerender: () => void;
  removePopstateListener: () => void;
};

type LinkRenderProps = {
  onClick: (event: Event) => void;
  isActive: () => boolean;
};

type LinkProps = ComponentProps & {
  to: string;
  render?: ((props: LinkRenderProps) => JSXElement) | null;
};

export function Link({ to, render = null, children }: LinkProps): JSXElement {
  const refs = useRefProxy();

  function _findTo(): string {
    return to.startsWith('.')
      ? (useContext(refs.head.current as HTMLElement, Route.Context) as RouteContextValue).getPath() + to.substring(1)
      : to;
  }

  function onClick(event: Event): void {
    const toPath = _findTo();
    if (toPath !== location.pathname) {
      (useContext(event.target as HTMLElement, Route.Context) as RouteContextValue).navigate(toPath, { initial: true });
      (useContext(document.body, Link.Context, { direction: 'down' }) as LinkContextValue[]).forEach(
        ({ rerender }) => rerender(),
      );
    }
  }

  function isActive(): boolean {
    return !!refs.head.current && location.pathname === _findTo();
  }

  function rerender(): void {
    if (render === null) {
      return;
    }
    const newHead = (
      <Link.Context.Provider value={{ rerender, removePopstateListener }}>
        {render({ onClick, isActive })}
      </Link.Context.Provider>
    );
    (refs.head.current as HTMLElement).replaceWith(newHead);
    refs.head.current = newHead;
  }
  setTimeout(rerender, 0);

  if (render !== null) {
    window.addEventListener('popstate', rerender);
  }

  function removePopstateListener(): void {
    window.removeEventListener('popstate', rerender);
  }

  return (
    <Link.Context.Provider
      value={{ rerender, removePopstateListener }}
      ref={refs.head}
    >
      {render === null && <button onClick={onClick}>{children}</button>}
      {render !== null && render({ onClick, isActive })}
    </Link.Context.Provider>
  );
}
Link.Context = createContext<LinkContextValue>();
