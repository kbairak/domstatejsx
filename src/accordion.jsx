import {
  combineHooks,
  createContext,
  useContext,
  useRefProxy,
  useStyleBoolean,
} from './lib/domstatejsx';

export default function App() {
  return (
    <div class="container mx-auto">
      <h1>No multi</h1>
      <Demo />
      <h1>Multi</h1>
      <Demo multi />
    </div>
  );
}

export function Demo({ multi = false }) {
  const refs = useRefProxy();

  function getButton(id) {
    return ({ toggle, isOpen }) => (
      <button onClick={toggle} class="bg-slate-100">
        trigger {id} {isOpen ? '^' : 'v'}
      </button>
    );
  }

  return (
    <div class="flex flex-col gap-y-2 mt-2">
      <div class="flex gap-x-2">
        {multi && (
          <button
            onClick={() => refs.accordion.context.expandAll()}
            class="border rounded p-1"
          >
            Expand All
          </button>
        )}
        <button
          onClick={() => refs.accordion.context.collapseAll()}
          class="border rounded p-1"
        >
          Collapse all
        </button>
        <button
          onClick={() => refs.accordion.context.triggerItem('2')}
          class="border rounded p-1"
        >
          Trigger item 2
        </button>
        <button
          onClick={() => refs.accordion.context.triggerItem('2', true)}
          class="border rounded p-1"
        >
          Show item 2
        </button>
        <div />
      </div>
      <Accordion
        multi={multi}
        ref={refs.accordion}
        class="flex flex-col gap-y-2"
      >
        <Accordion.Item
          renderTrigger={getButton('1')}
          id="1"
          class="border rounded p-2"
        >
          Content 1
        </Accordion.Item>
        <Accordion.Item
          renderTrigger={getButton('2')}
          id="2"
          class="border rounded p-2"
        >
          Content 2
        </Accordion.Item>
        <Accordion.Item
          renderTrigger={getButton('2')}
          id="3"
          class="border rounded p-2"
        >
          Content 3
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

function Accordion({ children, multi = false, class: className, style }) {
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
      <div class={className} style={style}>
        {children}
      </div>
    </Accordion.Context.Provider>
  );
}
Accordion.Context = createContext();

function AccordionItem({
  trigger,
  renderTrigger,
  id: defaultId,
  defaultHidden = true,
  class: className = null,
  style = null,
  children,
}) {
  const refs = useRefProxy();

  const [isContentHidden, setContentHidden] = combineHooks(
    useStyleBoolean(refs.content, 'display', 'none', null),
    [, rerenderTrigger],
  );

  const id = defaultId || crypto.randomUUID();
  function handleTrigger() {
    const { triggerItem } = useContext(refs.head.current, Accordion.Context);
    triggerItem(id);
  }

  function rerenderTrigger() {
    if (!renderTrigger) return;
    refs.trigger.current.replaceChildren(
      renderTrigger({ toggle: handleTrigger, isOpen: !isContentHidden() }),
    );
  }
  setTimeout(rerenderTrigger, 0);

  return (
    <Accordion.Item.Context.Provider
      value={{ id, setContentHidden }}
      ref={refs.head}
    >
      <div class={className} style={style}>
        <div ref={refs.trigger}>
          {renderTrigger ? (
            renderTrigger({ toggle: handleTrigger, isOpen: false })
          ) : (
            <button onClick={handleTrigger}>{trigger}</button>
          )}
        </div>
        <div
          style={{ display: defaultHidden ? 'none' : null }}
          ref={refs.content}
        >
          {children}
        </div>
      </div>
    </Accordion.Item.Context.Provider>
  );
}
Accordion.Item = AccordionItem;
Accordion.Item.Context = createContext();
