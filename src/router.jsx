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
            <Route path="/about" end element={About} />
            <Route path="/pages" element={Pages} />
          </>
        )}
      </Route>
    </Router>
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
        <Link to="/pages/1">1</Link>
        <Link to="/pages/2">2</Link>
        <Link to="/pages/3">3</Link>
      </div>
      <Route path="/:page" end element={Page} />
    </>
  );
}

function Page({ page }) {
  return <h1>This is page {page}</h1>;
}

function NotFound() {
  return (
    <h1>Page not found</h1>
  );
}
