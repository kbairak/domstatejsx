import { Route, Link } from './lib/domstatejsx';

export default function App() {
  return (
    <Route
      render={() => (
        <>
          <div>
            <Link
              to="/"
              render={({ onClick, isActive }) => (
                <button
                  onClick={onClick}
                  style={isActive() ? { backgroundColor: 'red' } : {}}
                >
                  Home
                </button>
              )}
            />
            <Link
              to="/about"
              render={({ onClick, isActive }) => (
                <button
                  onClick={onClick}
                  style={isActive() ? { backgroundColor: 'red' } : {}}
                >
                  About
                </button>
              )}
            />
            <Link
              to="/pages"
              render={({ onClick, isActive }) => (
                <button
                  onClick={onClick}
                  style={isActive() ? { backgroundColor: 'red' } : {}}
                >
                  Pages
                </button>
              )}
            />
          </div>
          <Route path="/" end render={Home} />
          <Route path="/about" end render={About} />
          <Route path="/pages" render={Pages} />
        </>
      )}
      NotFound={NotFound}
    />
  );
}

function Home() {
  return <h1>This is home</h1>;
}

function About() {
  return <h1>This is about</h1>;
}

function Pages() {
  return (
    <>
      <h1>This is pages</h1>
      <div>
        <Link
          to="/pages/1"
          render={({ onClick, isActive }) => (
            <button
              onClick={onClick}
              style={isActive() ? { backgroundColor: 'red' } : {}}
            >
              1
            </button>
          )}
        />
        <Link
          to="/pages/2"
          render={({ onClick, isActive }) => (
            <button
              onClick={onClick}
              style={isActive() ? { backgroundColor: 'red' } : {}}
            >
              2
            </button>
          )}
        />
        <Link
          to="/pages/3"
          render={({ onClick, isActive }) => (
            <button
              onClick={onClick}
              style={isActive() ? { backgroundColor: 'red' } : {}}
            >
              3
            </button>
          )}
        />
      </div>
      <Route path="/:page" end render={Page} />
    </>
  );
}

function Page({ page }) {
  if (['1', '2', '3'].includes(page)) {
    return <h1>This is page {page}</h1>;
  } else {
    return NotFound();
  }
}

function NotFound() {
  return <h1>Page not found</h1>;
}
