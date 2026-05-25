import {
  combineHooks,
  createContext,
  useList,
  usePropertyBoolean,
  useQuery,
  useRefProxy,
  useStyleBoolean,
} from '../domstatejsx';

async function fakeGet(page: number): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...Array(10)].map((_, i) => `product ${(page - 1) * 10 + i + 1}`);
}

export default function App() {
  const refs = useRefProxy();

  const [, setPrevDisabled] = usePropertyBoolean(
    refs.prevButton,
    'disabled',
    true,
    false,
  );
  const [, setLoading] = combineHooks(
    useStyleBoolean(refs.spinner, 'display', null, 'none'),
    useStyleBoolean(refs.pageList, 'display', 'none', null),
    usePropertyBoolean(refs.nextButton, 'disabled', true, false),
  );

  const { refetch } = useQuery({
    queryFn: (page = 1) => fakeGet(page),
    onStart: () => setLoading(true),
    onEnd: () => setLoading(false),
    onSuccess: (data) => {
      const { addPage, getPageNumber } = refs.pageList.context;
      addPage({ data });
      setPrevDisabled(getPageNumber() === 0);
    },
  });

  function handleNext() {
    const { getPageNumber, getPageCount, showPage } = refs.pageList.context;
    const currentPageNumber = getPageNumber();
    if (currentPageNumber === getPageCount() - 1) {
      refetch(currentPageNumber + 2);
    } else {
      showPage((prev: number) => prev + 1);
    }
    setPrevDisabled(false);
  }

  function handlePrevious() {
    const { getPageNumber, showPage } = refs.pageList.context;
    showPage((prev: number) => prev - 1);
    setPrevDisabled(getPageNumber() === 0);
  }

  return (
    <>
      <div>
        <button onClick={handlePrevious} disabled ref={refs.prevButton}>
          Prev
        </button>
        <button onClick={handleNext} ref={refs.nextButton}>
          Next
        </button>
      </div>
      <div ref={refs.spinner}>Loading...</div>
      <PageList ref={refs.pageList} />
    </>
  );
}

interface PageListContextValue {
  getPageNumber: () => number;
  getPageCount: () => number;
  addPage: (props: { data: string[] }) => void;
  showPage: (indexOrFunc: number | ((prev: number) => number)) => void;
}

function PageList() {
  const refs = useRefProxy();
  const [getPages, addPage] = combineHooks(useList(refs.head, Page), [
    ,
    () => showPage(getPageCount() - 1),
  ] as any);

  function getPageNumber(): number {
    return (getPages() as any).findIndex(({ context: { isHidden } }: any) => !isHidden());
  }

  function getPageCount(): number {
    return (getPages() as any).length;
  }

  function showPage(indexOrFunc: number | ((prev: number) => number)): void {
    const index =
      indexOrFunc instanceof Function
        ? indexOrFunc(getPageNumber())
        : indexOrFunc;
    (getPages() as any).forEach(({ context: { setIsHidden } }: any, i: number) =>
      setIsHidden(i !== index),
    );
  }

  return (
    <PageList.Context.Provider
      value={{ getPageNumber, getPageCount, addPage, showPage }}
      ref={refs.head}
    />
  );
}
PageList.Context = createContext<PageListContextValue>();

interface PageContextValue {
  isHidden: () => boolean;
  setIsHidden: (value: boolean | ((prev: boolean) => boolean)) => void;
}

interface PageProps {
  data: string[];
}

function Page({ data }: PageProps) {
  const refs = useRefProxy();
  const [isHidden, setIsHidden] = useStyleBoolean(
    refs.head,
    'display',
    'none',
    null,
  );

  return (
    <Page.Context.Provider value={{ isHidden, setIsHidden }} ref={refs.head}>
      <ul>
        {data.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </Page.Context.Provider>
  );
}
Page.Context = createContext<PageContextValue>();
