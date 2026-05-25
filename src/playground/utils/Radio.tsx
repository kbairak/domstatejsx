import { createContext, RefObject } from '../../domstatejsx';
import { v4 as uuid4 } from 'uuid';

type RadioOption<T> = [T, string];

interface RadioProps<T = any> {
  options: RadioOption<T>[];
  defaultValue?: T;
  onChange: (value: T | undefined) => void;
  ref?: any;
}

interface RadioContextValue<T = any> {
  get: () => T | undefined;
  set: (value: T) => void;
}

export default function Radio<T = any>({ options, defaultValue = undefined, onChange }: RadioProps<T>) {
  const refs: RefObject<HTMLInputElement>[] = [];

  function get(): T | undefined {
    const found = refs.find((r) => r.current?.checked);
    if (!found || !found.current) return undefined;
    return JSON.parse(found.current.dataset.value || 'null');
  }

  function set(value: T): void {
    const found = refs.find(
      (ref) => ref.current && JSON.parse(ref.current.dataset.value || 'null') === value,
    );
    if (found && found.current) found.current.checked = true;
  }

  const name = uuid4();
  return (
    <Radio.Context.Provider value={{ get, set }}>
      {options.map(([value, label]) => (
        <label key={JSON.stringify(value)}>
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
Radio.Context = createContext<RadioContextValue>();
