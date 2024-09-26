import './tailwind.css';
import { Link, Route } from './lib/domstatejsx';

import Accordion from './accordion';
import ControlledInput from './controlledInput';
import FakeApi from './fakeApi';
import Form from './form';
import Home from './home';
import JsonEdit from './jsonEdit';
import Pagination from './pagination';
import Panel from './panel';
import Router from './router';
import Todos from './todos';
import Pager from './pager';

function App() {
  function Button({ to, children }) {
    return (
      <Link
        to={to}
        render={({ onClick }) => (
          <button
            class="hover:text-fuchsia-600 transition-transform hover:scale-110"
            onClick={onClick}
          >
            {children}
          </button>
        )}
      />
    );
  }

  return (
    <Route
      path=""
      render={() => (
        <>
          <div class="bg-slate-900 text-white px-10 p-4 flex gap-x-4">
            <Button to="/home">Home</Button>
            <Button to="/accordion">Accordion</Button>
            <Button to="/controlledInput">Controlled Input</Button>
            <Button to="/fakeApi">Fake API</Button>
            <Button to="/form">Form</Button>
            <Button to="/jsonEdit">JSON Edit</Button>
            <Button to="/pagination">Pagination</Button>
            <Button to="/panel">Panel</Button>
            <Button to="/router">Router</Button>
            <Button to="/todos">Todos</Button>
            <Button to="/pager">Pager</Button>
          </div>
          <Route path="/" end render={() => ''} />
          <Route path="/home" end render={Home} />
          <Route path="/accordion" end render={Accordion} />
          <Route path="/controlledInput" end render={ControlledInput} />
          <Route path="/fakeApi" end render={FakeApi} />
          <Route path="/form" end render={Form} />
          <Route path="/jsonEdit" end render={JsonEdit} />
          <Route path="/pagination" end render={Pagination} />
          <Route path="/panel" end render={Panel} />
          <Route path="/router" render={Router} />
          <Route path="/todos" end render={Todos} />
          <Route path="/pager" end render={Pager} />
        </>
      )}
      NotFound={() => (
        <div class="fixed inset-0 bg-slate-700 text-white text-center text-6xl p-16">
          Page not found
        </div>
      )}
    />
  );
}

document.body.append(<App />);
