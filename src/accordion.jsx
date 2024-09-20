import {
  createContext,
  useContext,
  useRefProxy,
  useStyleBoolean,
} from './lib/domstatejsx';

export default function App() {
  const refs = useRefProxy();

  function handleExpandAll() {
    refs.accordion.context.expandAll();
  }
  function handleCollapseAll() {
    refs.accordion.context.collapseAll();
  }
  function handleTriggerItem2() {
    refs.accordion.context.triggerItem('2');
  }
  function handleShowItem2() {
    refs.accordion.context.triggerItem('2', true);
  }

  return (
    <>
      <div class="flex gap-x-1 m-2">
        {/* row of buttons */}
        <button
          class="hover:text-fuchsia-600 transition-transform hover:scale-110 px-2 border rounded"
          onClick={handleExpandAll}
        >
          Expand All
        </button>
        <button
          class="hover:text-fuchsia-600 transition-transform hover:scale-110 px-2 border rounded"
          onClick={handleCollapseAll}
        >
          Collapse all
        </button>
        <button
          class="hover:text-fuchsia-600 transition-transform hover:scale-110 px-2 border rounded"
          onClick={handleTriggerItem2}
        >
          Trigger item 2
        </button>
        <button
          class="hover:text-fuchsia-600 transition-transform hover:scale-110 px-2 border rounded"
          onClick={handleShowItem2}
        >
          Show item 2
        </button>
      </div>
      <Accordion ref={refs.accordion}>
        <Accordion.Item trigger="trigger 1" id="1">
          Content 1
        </Accordion.Item>
        <Accordion.Item trigger="trigger 2" id="2">
          Content 2
        </Accordion.Item>
        <Accordion.Item trigger="trigger 3" id="3">
          Content 3
        </Accordion.Item>
      </Accordion>
    </>
  );
}

function Accordion({ children, multi = false }) {
  const refs = useRefProxy();

  function triggerItem(id, show = null) {
    const items = useContext(refs.head.current, Accordion.Item.Context, {
      direction: 'down',
    });

    if (!multi) {
      items
        .filter(({ id: itemId }) => itemId !== id)
        .forEach(({ setContentHidden }) => setContentHidden(true));
    }

    items
      .find(({ id: itemId }) => id === itemId)
      .setContentHidden(show === null ? (prev) => !prev : !show);
  }

  function expandAll() {
    if (!multi) return;
    useContext(refs.head.current, Accordion.Item.Context, {
      direction: 'down',
    }).forEach(({ setContentHidden }) => setContentHidden(false));
  }

  function collapseAll() {
    useContext(refs.head.current, Accordion.Item.Context, {
      direction: 'down',
    }).forEach(({ setContentHidden }) => setContentHidden(true));
  }

  return (
    <Accordion.Context.Provider
      value={{ triggerItem, expandAll, collapseAll }}
      ref={refs.head}
    >
      {children}
    </Accordion.Context.Provider>
  );
}
Accordion.Context = createContext();

function AccordionItem({
  trigger,
  renderTrigger,
  id: defaultId,
  defaultHidden = true,
  children,
}) {
  const refs = useRefProxy();

  const [, setContentHidden] = useStyleBoolean(
    refs.content,
    'display',
    'none',
    null,
  );

  const id = defaultId || crypto.randomUUID();
  function handleTrigger() {
    const { triggerItem } = useContext(refs.head.current, Accordion.Context);
    triggerItem(id);
  }

  return (
    <Accordion.Item.Context.Provider
      value={{ id, setContentHidden }}
      ref={refs.head}
    >
      <div>
        {trigger ? (
          <button onClick={handleTrigger}>{trigger}</button>
        ) : (
          renderTrigger(handleTrigger)
        )}
      </div>
      <div
        style={{ display: defaultHidden ? 'none' : null }}
        ref={refs.content}
      >
        {children}
      </div>
    </Accordion.Item.Context.Provider>
  );
}
Accordion.Item = AccordionItem;
Accordion.Item.Context = createContext();
