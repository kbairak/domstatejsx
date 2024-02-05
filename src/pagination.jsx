import {
  combineHooks,
  createContext, useContext, usePropertyBoolean, useQuery, useRefs, useStyleBoolean
} from './lib/domstatejsx';

async function fakeGet(page) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...Array(10)].map((_, i) => `product ${(page - 1) * 10 + i + 1}`);
}

export default function App() {
  const [prevButton, nextButton, spinner, pageList] = useRefs();

  const [, setPrevDisabled] = usePropertyBoolean(prevButton, 'disabled', true, false);
  const [, setLoading] = combineHooks(
    useStyleBoolean(spinner, 'display', null, 'none'),
    useStyleBoolean(pageList, 'display', 'none', null),
    usePropertyBoolean(nextButton, 'disabled', true, false),
  );

  const { fetch } = useQuery({
    queryFn: (page) => fakeGet(page),
    onStart: () => setLoading(true),
    onEnd: () => setLoading(false),
    onSuccess: (data) => {
      const { addPage, getPageNumber } = pageList.context;
      addPage(data);
      setPrevDisabled(getPageNumber() === 0);
    },
    call: false,
  });
  setTimeout(() => fetch(1), 0);

  function handleNext() {
    const { getPageNumber, getPageCount, showPage } = pageList.context;
    if (getPageNumber() === getPageCount() - 1) {
      fetch(getPageNumber() + 2);
    } else {
      showPage((prev) => prev + 1);
    }
    setPrevDisabled(getPageNumber() === 0);
  }

  function handlePrevious() {
    const { getPageNumber, showPage } = pageList.context;
    showPage((prev) => prev - 1);
    setPrevDisabled(getPageNumber() === 0);
  }

  return (
    <>
      <div>
        <button onClick={handlePrevious} disabled ref={prevButton}>Prev</button>
        <button onClick={handleNext} ref={nextButton}>Next</button>
      </div>
      <div ref={spinner}>Loading...</div>
      <PageList ref={pageList} />
    </>
  );
}

function PageList() {
  const [head] = useRefs();

  function getPageNumber() {
    return useContext(head.current, Page.Context, { direction: 'down' })
      .findIndex(({ isHidden }) => !isHidden());
  }

  function getPageCount() {
    return useContext(head.current, Page.Context, { direction: 'down' }).length;
  }

  function showPage(indexOrFunc) {
    const index = (
      indexOrFunc instanceof Function ? indexOrFunc(getPageNumber()) : indexOrFunc
    );
    useContext(head.current, Page.Context, { direction: 'down' })
      .forEach(({ setIsHidden }, i) => { setIsHidden(i !== index); });
  }

  function addPage(data) {
    head.current.append(<Page data={data} />);
    showPage(getPageCount() - 1);
  }

  return (
    <PageList.Context.Provider
      value={{ getPageNumber, getPageCount, addPage, showPage }}
      ref={head}
    />
  );
}
PageList.Context = createContext();

function Page({ data }) {
  const [page] = useRefs();

  const [isHidden, setIsHidden] = useStyleBoolean(page, 'display', 'none', null);

  return (
    <Page.Context.Provider value={{ isHidden, setIsHidden }}>
      <ul ref={page}>
        {data.map((message) => <li>{message}</li>)}
      </ul>
    </Page.Context.Provider>
  );
}
Page.Context = createContext();
