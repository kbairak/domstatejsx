import { createContext } from '../lib/domstatejsx';

export default function Radio({ options, defaultValue = undefined, onChange }) {
  const refs = [];

  function get() {
    const found = refs.find((r) => r.current.checked);
    if (!found) return undefined;
    return JSON.parse(found.current.dataset.value);
  }

  function set(value) {
    const found = refs.find(
      (ref) => JSON.parse(ref.current.dataset.value) === value,
    );
    if (found) found.current.checked = true;
  }

  const name = crypto.randomUUID();
  return (
    <Radio.Context.Provider value={{ get, set }}>
      {options.map(([value, label]) => (
        <label>
          <input
            type="radio"
            name={name}
            onClick={() => onChange(get())}
            checked={value === defaultValue}
            data-value={JSON.stringify(value)}
            ref={(r) => refs.push(r)}
          />
          {label}
        </label>
      ))}
    </Radio.Context.Provider>
  );
}
Radio.Context = createContext();
