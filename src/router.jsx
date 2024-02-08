import { Router, Route, Link } from './lib/domstatejsx';

export default function App() {
  return (
    <Router NotFound={NotFound}>
      <Route path="">
        {() => (
          <>
            <div>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/pages">Pages</Link>
            </div>
            <Route path="/" end element={Home} />
            <Route path="/about" end>{() => <h1>This is about</h1>}</Route>
            <Route path="/pages">
              {() => (
                <>
                  <h1>This is pages</h1>
                  <div>
                    <Link to="/pages/1">1</Link>
                    <Link to="/pages/2">2</Link>
                    <Link to="/pages/3">3</Link>
                  </div>
                  <div>
                    <Route path="/:page" end>
                      {({ page }) => <h1>This is page {page}</h1>}
                    </Route>
                  </div>
                </>
              )}
            </Route>
          </>
        )}
      </Route>
    </Router>
  );
}

function Home() {
  return <h1>This is home</h1>;
}

function NotFound() {
  return (
    <h1>Page not found</h1>
  );
}
