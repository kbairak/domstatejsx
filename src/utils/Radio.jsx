import { createContext } from '../lib/domstatejsx';

export default function Radio({ options, defaultValue = undefined, onChange }) {
  const refs = [];
  const ref = (r) => refs.push(r);

  function get() {
    const found = refs.find((r) => r.current.checked);
    if (!found) return undefined;
    return JSON.parse(found.current.dataset.value);
  }

  function set(value) {
    refs.forEach((ref) => (ref.current.checked = false));
    const found = refs.find(
      (ref) => JSON.parse(ref.current.dataset.value) === value,
    );
    if (found) found.current.checked = true;
  }

  function handleChange(value) {
    set(value);
    onChange(value);
  }

  return (
    <Radio.Context.Provider value={{ get, set }}>
      {options.map(([value, label]) => (
        <label>
          <input
            type="radio"
            onClick={() => handleChange(value)}
            checked={value === defaultValue}
            data-value={JSON.stringify(value)}
            ref={ref}
          />
          {label}
        </label>
      ))}
    </Radio.Context.Provider>
  );
}
Radio.Context = createContext();
