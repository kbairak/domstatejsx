import { createContext, useContext, useRefs, useStyleBoolean } from './lib/domstatejsx';

export default function App() {
  const [accordionRef] = useRefs();

  function handleExpandAll() { accordionRef.context.expandAll(); }
  function handleCollapseAll() { accordionRef.context.collapseAll(); }
  function handleTriggerItem2() { accordionRef.context.triggerItem('2'); }
  function handleShowItem2() { accordionRef.context.triggerItem('2', true); }

  return (
    <>
      <div>
        <button onClick={handleExpandAll}>Expand All</button>
        <button onClick={handleCollapseAll}>Collapse all</button>
        <button onClick={handleTriggerItem2}>Trigger item 2</button>
        <button onClick={handleShowItem2}>Show item 2</button>
      </div>
      <Accordion ref={accordionRef}>
        <Accordion.Item trigger="trigger 1" id="1">Content 1</Accordion.Item>
        <Accordion.Item trigger="trigger 2" id="2">Content 2</Accordion.Item>
        <Accordion.Item trigger="trigger 3" id="3">Content 3</Accordion.Item>
      </Accordion>
    </>
  );
}


function Accordion({ children, multi = false }) {
  const head = {};

  function triggerItem(id, show = null) {
    const items = useContext(head.current, Accordion.Item.Context, { direction: 'down' });

    if (!multi) {
      items
        .filter(({ id: itemId }) => itemId !== id)
        .forEach(({ setContentHidden }) => setContentHidden(true));
    }

    items
      .find(({ id: itemId }) => id === itemId)
      .setContentHidden(show === null ? ((prev) => !prev) : !show);
  }

  function expandAll() {
    if (!multi) return;
    useContext(head.current, Accordion.Item.Context, { direction: 'down' })
      .forEach(({ setContentHidden }) => setContentHidden(false));
  }

  function collapseAll() {
    useContext(head.current, Accordion.Item.Context, { direction: 'down' })
      .forEach(({ setContentHidden }) => setContentHidden(true));
  }

  return (
    <Accordion.Context.Provider value={{ triggerItem, expandAll, collapseAll }} ref={head}>
      {children}
    </Accordion.Context.Provider >
  );
}
Accordion.Context = createContext();


function AccordionItem({ trigger, id: defaultId, defaultHidden = true, children }) {
  const [head, contentDiv] = useRefs();

  const [, setContentHidden] = useStyleBoolean(contentDiv, 'display', 'none', null);

  const id = defaultId || crypto.randomUUID();
  function handleTrigger() {
    const { triggerItem } = useContext(head.current, Accordion.Context);
    triggerItem(id);
  }

  return (
    <Accordion.Item.Context.Provider value={{ id, setContentHidden }} ref={head}>
      <div><button onClick={handleTrigger}>{trigger}</button></div>
      <div style={{ display: defaultHidden ? 'none' : null }} ref={contentDiv}>{children}</div>
    </Accordion.Item.Context.Provider>
  );
}
Accordion.Item = AccordionItem;
Accordion.Item.Context = createContext();
