import {
  combineHooks,
  createContext,
  useRefs,
  useTextContent,
  useControlledInput,
} from './lib/domstatejsx';

export default function App() {
  const [inputRef, spanRef] = useRefs();

  const [, set] = combineHooks(
    useControlledInput(inputRef),
    useTextContent(spanRef),
  );

  return (
    <>
      <Radio
        defaultValue="Three"
        onChange={set}
        options={['Zero', 'One', 'Two', 'Three']}
        ref={inputRef}
      />
      <p>
        <button onClick={() => set('Two')}>Select "two"</button>
      </p>
      <p>
        Selected Value: <span ref={spanRef} />
      </p>
    </>
  );
}

function Radio({ defaultValue = undefined, onChange, options }) {
  const refs = [];
  const ref = (r) => refs.push(r);

  function get() {
    return refs.find((ref) => ref.current.checked).current.nextSibling
      .textContent;
  }

  function set(value) {
    refs.forEach((ref) => (ref.current.checked = false));
    refs.find(
      (ref) => ref.current.nextSibling.textContent === value,
    ).current.checked = true;
  }

  function handleClick(option) {
    set(option);
    onChange(option);
  }

  if (defaultValue !== undefined) {
    setTimeout(() => handleClick(defaultValue), 0);
  }

  return (
    <Radio.Context.Provider value={{ get, set }}>
      {options.map((option) => (
        <label>
          <input ref={ref} type="radio" onClick={() => handleClick(option)} />
          {option}
        </label>
      ))}
    </Radio.Context.Provider>
  );
}
Radio.Context = createContext();
