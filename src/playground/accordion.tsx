import {
  combineHooks,
  createContext,
  useContext,
  useRefProxy,
  useStyleBoolean,
} from '../domstatejsx';
import { v4 as uuid4 } from 'uuid';

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

const AccordionContext = createContext();
const AccordionItemContext = createContext();

export function Demo({ multi = false }: { multi?: boolean }) {
  const refs = useRefProxy();
  const AccItem = (Accordion as any).Item;

  function getButton(id: string) {
    return ({ toggle, isOpen }: any) => (
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
        <AccItem
          renderTrigger={getButton('1')}
          id="1"
          class="border rounded p-2"
        >
          Content 1
        </AccItem>
        <AccItem
          renderTrigger={getButton('2')}
          id="2"
          class="border rounded p-2"
        >
          Content 2
        </AccItem>
        <AccItem
          renderTrigger={getButton('2')}
          id="3"
          class="border rounded p-2"
        >
          Content 3
        </AccItem>
      </Accordion>
    </div>
  );
}

function Accordion({ children, multi = false, class: className, style }: any) {
  const refs = useRefProxy();

  function triggerItem(id: string, show: any = null) {
    const items = useContext(refs.head.current, AccordionItemContext, {
      direction: 'down',
    }) as any;

    if (!multi) {
      items
        .filter(({ id: itemId }: any) => itemId !== id)
        .forEach(({ setContentHidden }: any) => setContentHidden(true));
    }

    items
      .find(({ id: itemId }: any) => id === itemId)
      .setContentHidden(show === null ? (prev: boolean) => !prev : !show);
  }

  function expandAll() {
    if (!multi) return;
    (
      useContext(refs.head.current, AccordionItemContext, {
        direction: 'down',
      }) as any
    ).forEach(({ setContentHidden }: any) => setContentHidden(false));
  }

  function collapseAll() {
    (
      useContext(refs.head.current, AccordionItemContext, {
        direction: 'down',
      }) as any
    ).forEach(({ setContentHidden }: any) => setContentHidden(true));
  }

  return (
    <AccordionContext.Provider
      value={{ triggerItem, expandAll, collapseAll }}
      ref={refs.head}
    >
      <div class={className} style={style}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
(Accordion as any).Context = AccordionContext;

function AccordionItem({
  trigger,
  renderTrigger,
  id: defaultId,
  defaultHidden = true,
  class: className,
  style,
  children,
}: any) {
  const refs = useRefProxy();

  const [isContentHidden, setContentHidden] = combineHooks(
    useStyleBoolean(refs.content, 'display', 'none', null),
    [, rerenderTrigger] as any,
  );

  const id = defaultId || uuid4();
  function handleTrigger() {
    const { triggerItem } = useContext(
      refs.head.current,
      AccordionContext,
    ) as any;
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
    <AccordionItemContext.Provider
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
          style={{ display: defaultHidden ? 'none' : undefined }}
          ref={refs.content}
        >
          {children}
        </div>
      </div>
    </AccordionItemContext.Provider>
  );
}
(Accordion as any).Item = AccordionItem;
(Accordion as any).Item.Context = AccordionItemContext;
