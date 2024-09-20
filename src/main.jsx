import './tailwind.css';
import { Link, Route } from './lib/domstatejsx';

import Accordion from './accordion';
import AlternativeRef from './alternativeRef';
import ControlledInput from './controlledInput';
import FakeApi from './fakeApi';
import Form from './form';
import JsonEdit from './jsonEdit';
import Pagination from './pagination';
import Panel from './panel';
import Router from './router';
import Todos from './todos';

function App() {
  return (
    <Route
      path=""
      render={() => (
        <>
          <div class="bg-slate-900 text-white px-10 p-4 flex gap-x-4">
            <Link
              to="/accordion"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Accordion
                </button>
              )}
            />
            <Link
              to="/alternativeRef"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Alternative Ref
                </button>
              )}
            />
            <Link
              to="/controlledInput"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Controlled
                </button>
              )}
            />
            <Link
              to="/fakeApi"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Fake API
                </button>
              )}
            />
            <Link
              to="/form"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Form
                </button>
              )}
            />
            <Link
              to="/jsonEdit"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  JSON
                </button>
              )}
            />
            <Link
              to="/pagination"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Pagination
                </button>
              )}
            />
            <Link
              to="/panel"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Panel
                </button>
              )}
            />
            <Link
              to="/router"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Router
                </button>
              )}
            />
            <Link
              to="/todos"
              render={({ onClick }) => (
                <button
                  class="hover:text-fuchsia-600 transition-transform hover:scale-110"
                  onClick={onClick}
                >
                  Todos
                </button>
              )}
            />
          </div>
          <Route path="/" end render={() => ''} />
          <Route path="/accordion" end render={Accordion} />
          <Route path="/alternativeRef" end render={AlternativeRef} />
          <Route path="/controlledInput" end render={ControlledInput} />
          <Route path="/fakeApi" end render={FakeApi} />
          <Route path="/form" end render={Form} />
          <Route path="/jsonEdit" end render={JsonEdit} />
          <Route path="/pagination" end render={Pagination} />
          <Route path="/panel" end render={Panel} />
          <Route path="/router" render={Router} />
          <Route path="/todos" end render={Todos} />
        </>
      )}
      NotFound={() => (
        // Full screen with dark background and big white "Page not found" message in the center
        <div class="fixed inset-0 bg-slate-700 text-white text-center text-6xl p-16">
          Page not found
        </div>
      )}
    />
  );
}

document.body.append(<App />);
