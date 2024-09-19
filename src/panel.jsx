import {
  combineHooks,
  createContext,
  useClassBoolean,
  useRefProxy,
} from './lib/domstatejsx';
import './tailwind.css';

export default function App() {
  return (
    <>
      <Panel
        renderTrigger={(open) => <button onClick={open}>Clickme</button>}
        render={(close) => (
          <>
            This is the panel
            <button onClick={close}>Close</button>
          </>
        )}
      />
    </>
  );
}

function Panel({ children, render, renderTrigger, defaultIsShown = false }) {
  const refs = useRefProxy();
  const [isShown, setShown] = combineHooks(
    useClassBoolean(refs.dark, null, 'invisible'),
    useClassBoolean(refs.dark, 'bg-black/50', 'bg-black/0'),
    useClassBoolean(refs.panel, 'translate-x-0', 'translate-x-full'),
  );

  return (
    <Panel.Context.Provider value={{ isShown, setShown }}>
      {renderTrigger && renderTrigger(() => setShown(true))}
      <div
        class={`
          fixed inset-0 transition-colors
          ${defaultIsShown ? 'bg-black/50' : 'bg-black/0 invisible'}
        `}
        onClick={() => setShown(false)}
        ref={refs.dark}
      />
      <div
        class={`
          fixed inset-y-0 right-0 w-1/4 bg-white shadow-lg transition-transform
          ${defaultIsShown ? 'translate-x-0' : 'translate-x-full'}
        `}
        ref={refs.panel}
      >
        {children || render(() => setShown(false))}
      </div>
    </Panel.Context.Provider>
  );
}
Panel.Context = createContext();
