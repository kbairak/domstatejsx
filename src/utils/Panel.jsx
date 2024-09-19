import {
  combineHooks,
  createContext,
  useClassBoolean,
  useRefProxy,
} from '../lib/domstatejsx';

export default function Panel({
  renderTrigger,
  children,
  render = () => {},
  defaultIsOpen = false,
}) {
  const refs = useRefProxy();
  const [isOpen, setIsOpen] = combineHooks(
    useClassBoolean(refs.dark, 'bg-black/50', ['bg-black/0', 'invisible']),
    useClassBoolean(refs.panel, 'translate-x-0', 'translate-x-full'),
  );

  return (
    <Panel.Context.Provider value={{ get: isOpen, set: setIsOpen }}>
      {renderTrigger && renderTrigger(() => setIsOpen(true))}
      <div
        class={`
          fixed inset-0 transition-colors
          ${defaultIsOpen ? 'bg-black/50' : 'bg-black/0 invisible'}
        `}
        onClick={() => setIsOpen(false)}
        ref={refs.dark}
      />
      <div
        class={`
          fixed inset-y-0 right-0 w-1/4 bg-white shadow-lg transition-transform
          ${defaultIsOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        ref={refs.panel}
      >
        {children || render(() => setIsOpen(false))}
      </div>
    </Panel.Context.Provider>
  );
}
Panel.Context = createContext();
