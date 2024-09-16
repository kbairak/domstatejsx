import './tailwind.css';

import {
  createContext,
  useClassBoolean,
  useControlledInput,
  useNumberInput,
  useRefs,
  useTextContent,
  useTextInput,
} from './lib/domstatejsx';
import Radio from './utils/Radio';

export default function App() {
  const [jsonEditRef, preRef] = useRefs();

  const [getJson] = useControlledInput(jsonEditRef);

  const [, setPre] = useTextContent(preRef);

  return (
    <>
      <JsonEdit
        onChange={() => setPre(JSON.stringify(getJson(), null, 2))}
        ref={jsonEditRef}
      />
      <pre ref={preRef}>null</pre>
    </>
  );
}

function JsonEdit({ onChange, defaultValue = null }) {
  const [
    typeSelectRef,
    booleanSpanRef,
    booleanRadioRef,
    numberSpanRef,
    numberInputRef,
    stringSpanRef,
    stringInputRef,
  ] = useRefs();

  const [getType, setType] = useTextInput(typeSelectRef);

  function get() {
    if (getType() === 'null') {
      return null;
    } else if (getType() === 'boolean') {
      return getBoolean();
    } else if (getType() === 'number') {
      return getNumber();
    } else if (getType() === 'string') {
      return getString();
    }
  }

  function set(value) {
    if (value === null) {
      setType('null');
      setBooleanVisible(false);
      setNumberVisible(false);
      setStringVisible(false);
    } else if (typeof value === 'boolean') {
      setType('boolean');
      setBooleanVisible(true);
      setNumberVisible(false);
      setStringVisible(false);
      setBoolean(value);
    } else if (typeof value === 'number') {
      setType('number');
      setBooleanVisible(false);
      setNumberVisible(true);
      setStringVisible(false);
      setNumber(value);
    } else if (typeof value === 'string') {
      setType('string');
      setBooleanVisible(false);
      setNumberVisible(false);
      setStringVisible(true);
      setString(value);
    }
  }

  function handleTypeChange(type) {
    if (type === 'null') {
      set(null);
      onChange(null);
    } else if (type === 'boolean') {
      set(false);
      onChange(false);
    } else if (type === 'number') {
      set(0);
      onChange(0);
    } else if (type === 'string') {
      set('');
      onChange('');
    }
  }

  const [, setBooleanVisible] = useClassBoolean(booleanSpanRef, null, 'hidden');
  const [getBoolean, setBoolean] = useControlledInput(booleanRadioRef);

  const [, setNumberVisible] = useClassBoolean(numberSpanRef, null, 'hidden');
  const [getNumber, setNumber] = useNumberInput(numberInputRef);

  const [, setStringVisible] = useClassBoolean(stringSpanRef, null, 'hidden');
  const [getString, setString] = useTextInput(stringInputRef);

  return (
    <JsonEdit.Context.Provider value={{ get, set }}>
      <div class="flex gap-x-2 border border-gray-300 rounded p-2 m-2">
        <select
          onChange={(e) => handleTypeChange(e.target.value)}
          ref={typeSelectRef}
        >
          <option value="null" selected={defaultValue === null}>
            null
          </option>
          <option value="boolean" selected={typeof defaultValue === 'boolean'}>
            boolean
          </option>
          <option value="number" selected={typeof defaultValue === 'number'}>
            number
          </option>
          <option value="string" selected={typeof defaultValue === 'string'}>
            string
          </option>
        </select>
        <span
          class={typeof defaultValue === 'boolean' ? '' : 'hidden'}
          ref={booleanSpanRef}
        >
          <Radio
            options={[
              [false, 'false'],
              [true, 'true'],
            ]}
            defaultValue={
              typeof defaultValue === 'boolean' ? defaultValue : undefined
            }
            onChange={onChange}
            ref={booleanRadioRef}
          />
        </span>
        <span
          class={typeof defaultValue === 'number' ? '' : 'hidden'}
          ref={numberSpanRef}
        >
          <input
            type="number"
            defaultValue={
              typeof defaultValue === 'number' ? defaultValue : undefined
            }
            onKeyUp={(e) => onChange(parseFloat(e.target.value))}
            class="border border-gray-300 rounded p-x-1"
            ref={numberInputRef}
          />
        </span>
        <span
          class={typeof defaultValue === 'string' ? '' : 'hidden'}
          ref={stringSpanRef}
        >
          <input
            defaultValue={
              typeof defaultValue === 'string' ? defaultValue : undefined
            }
            onKeyUp={(e) => onChange(e.target.value)}
            class="border border-gray-300 rounded p-x-1"
            ref={stringInputRef}
          />
        </span>
      </div>
    </JsonEdit.Context.Provider>
  );
}
JsonEdit.Context = createContext();
