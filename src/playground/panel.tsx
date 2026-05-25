import './tailwind.css';
import Panel from './utils/Panel';

export default function App() {
  return (
    <Panel
      renderTrigger={(open) => <button onClick={open}>Clickme</button>}
      render={(close) => (
        <>
          This is the panel
          <button onClick={close}>Close</button>
        </>
      )}
    />
  );
}
