import {
  createContext,
  usePropertyBoolean,
  useRefProxy,
} from './lib/domstatejsx';

export default function App() {
  const refs = useRefProxy();

  const [, setPreviousDisabled] = usePropertyBoolean(
    refs.previousButton,
    'disabled',
    true,
    false,
  );
  const [, setNextDisabled] = usePropertyBoolean(
    refs.nextButton,
    'disabled',
    true,
    false,
  );

  function handlePrevious() {
    refs.pager.context.setPreviousPage();
    _setDisabled();
  }

  function handleNext() {
    refs.pager.context.setNextPage();
    _setDisabled();
  }

  function _setDisabled() {
    setPreviousDisabled(!refs.pager.context.hasPrevious());
    setNextDisabled(!refs.pager.context.hasNext());
  }

  const buttonClass = `border rounded px-1 disabled:opacity-50 hover:bg-slate-100
    transition-transform hover:scale-110 disabled:scale-100`;

  setTimeout(_setDisabled, 0);

  return (
    <>
      <Pager ref={refs.pager}>
        <div>Page 1</div>
        <div>Page 2</div>
        <div>Page 3</div>
        <div>Page 4</div>
        <div>Page 5</div>
      </Pager>
      <div class="flex gap-x-2">
        <button
          onClick={handlePrevious}
          class={buttonClass}
          ref={refs.previousButton}
        >
          Previous
        </button>
        <button onClick={handleNext} class={buttonClass} ref={refs.nextButton}>
          Next
        </button>
      </div>
    </>
  );
}

function Pager({ children, defaultPage = 0 }) {
  const head = {};

  function getPage() {
    return [...head.current.children].findIndex(
      (node) => node.style.display !== 'none',
    );
  }

  function setPage(page) {
    [...head.current.children].forEach((node, i) => {
      if (i === page) node.style.display = '';
      else node.style.display = 'none';
    });
  }

  function getPageCount() {
    return head.current.children.length;
  }

  function setPreviousPage() {
    return setPage(getPage() - 1);
  }

  function setNextPage() {
    return setPage(getPage() + 1);
  }

  function hasPrevious() {
    return getPage() > 0;
  }

  function hasNext() {
    return getPage() < getPageCount() - 1;
  }

  setTimeout(() => setPage(defaultPage), 0);

  return (
    <Pager.Context.Provider
      value={{
        getPage,
        setPage,
        getPageCount,
        setNextPage,
        setPreviousPage,
        hasPrevious,
        hasNext,
      }}
      ref={head}
    >
      {children}
    </Pager.Context.Provider>
  );
}
Pager.Context = createContext();
