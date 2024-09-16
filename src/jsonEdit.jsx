import './tailwind.css';

import {
  createContext,
  useClassBoolean,
  useControlledInput,
  useList,
  useNumberInput,
  useRefs,
  useTextContent,
  useTextInput,
} from './lib/domstatejsx';
import Radio from './utils/Radio';

export default function App() {
  const [preRef] = useRefs();

  const [, setPre] = useTextContent(preRef);

  // Use flex to split screen horizontaly fifty-fifty
  return (
    <div class="flex">
      <div class="w-1/2">
        <JsonEdit
          onChange={(value) => setPre(JSON.stringify(value, null, 2))}
          defaultValue={null}
        />
      </div>
      <div class="w-1/2">
        <pre ref={preRef}>null</pre>
      </div>
    </div>
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
    arrayDivRef,
    arrayListRef,
  ] = useRefs();

  const [getType] = useTextInput(typeSelectRef);
  function get() {
    const type = getType();
    if (type === 'null') return null;
    else if (type === 'boolean') return getBoolean();
    else if (type === 'number') return getNumber();
    else if (type === 'string') return getString();
    else if (type === 'array') return getArray();
  }

  function toggleVisible(type) {
    [
      ['null', () => {}],
      ['boolean', setBooleanVisible],
      ['number', setNumberVisible],
      ['string', setStringVisible],
      ['array', setArrayVisible],
    ].forEach(([t, setVisible]) => {
      setVisible(t === type);
    });
  }

  // Type
  function handleTypeChange(type) {
    if (type === 'null') {
      onChange(null);
    } else if (type === 'boolean') {
      setBoolean(false);
      onChange(false);
    } else if (type === 'number') {
      setNumber(0);
      onChange(0);
    } else if (type === 'string') {
      setString('');
      onChange('');
    } else if (type === 'array') {
      setArray([]);
      onChange([]);
    }
    toggleVisible(type);
  }

  // Boolean
  const [, setBooleanVisible] = useClassBoolean(booleanSpanRef, null, 'hidden');
  const [getBoolean, setBoolean] = useControlledInput(booleanRadioRef);

  // Number
  const [, setNumberVisible] = useClassBoolean(numberSpanRef, null, 'hidden');
  const [getNumber, setNumber] = useNumberInput(numberInputRef);

  // String
  const [, setStringVisible] = useClassBoolean(stringSpanRef, null, 'hidden');
  const [getString, setString] = useTextInput(stringInputRef);
  if (typeof defaultValue === 'string') {
    setTimeout(() => stringInputRef.current.focus(), 0);
  }

  // Array
  const [, setArrayVisible] = useClassBoolean(arrayDivRef, null, 'hidden');
  const [getArrayRefs, addArrayItems, resetArrayItems] = useList(
    arrayListRef,
    ArrayItem,
  );
  function getArray() {
    return getArrayRefs().map(({ context: { get } }) => get());
  }
  function setArray(items) {
    resetArrayItems(
      ...items.map((item) => ({
        defaultValue: item,
        onChange: () => onChange(getArray()),
      })),
    );
  }
  function handleAddItemToArray(item) {
    addArrayItems({ defaultValue: item, onChange: () => onChange(getArray()) });
    onChange(getArray());
  }

  if (Array.isArray(defaultValue)) {
    setTimeout(() => setArray(defaultValue), 0);
  }

  return (
    <JsonEdit.Context.Provider value={{ get }}>
      <div class="flex gap-x-2 border border-gray-300 rounded p-2 m-2">
        {/* Type select */}
        <div>
          <select
            onChange={(e) => handleTypeChange(e.target.value)}
            class="p-1 rounded"
            ref={typeSelectRef}
          >
            <option value="null" selected={defaultValue === null}>
              null
            </option>
            <option
              value="boolean"
              selected={typeof defaultValue === 'boolean'}
            >
              boolean
            </option>
            <option value="number" selected={typeof defaultValue === 'number'}>
              number
            </option>
            <option value="string" selected={typeof defaultValue === 'string'}>
              string
            </option>
            <option value="array" selected={Array.isArray(defaultValue)}>
              array
            </option>
          </select>
        </div>

        {/* Boolean */}
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

        {/* Number */}
        <span
          class={typeof defaultValue === 'number' ? '' : 'hidden'}
          ref={numberSpanRef}
        >
          <input
            type="number"
            value={typeof defaultValue === 'number' ? defaultValue : undefined}
            onKeyUp={(e) => onChange(parseFloat(e.target.value))}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            class="border border-gray-300 rounded p-x-1"
            ref={numberInputRef}
          />
        </span>

        {/* String */}
        <span
          class={typeof defaultValue === 'string' ? '' : 'hidden'}
          ref={stringSpanRef}
        >
          <input
            value={typeof defaultValue === 'string' ? defaultValue : undefined}
            onKeyUp={(e) => onChange(e.target.value)}
            class="border border-gray-300 rounded p-x-1"
            ref={stringInputRef}
          />
        </span>

        {/* Array */}
        <div
          class={[
            'flex flex-col',
            ...(Array.isArray(defaultValue) ? [] : ['hidden']),
          ].join(' ')}
          ref={arrayDivRef}
        >
          <div ref={arrayListRef} />
          <button
            onClick={() => handleAddItemToArray('')}
            class="border rounded p-x-1 bg-blue-50"
          >
            Add
          </button>
        </div>
      </div>
    </JsonEdit.Context.Provider>
  );
}
JsonEdit.Context = createContext();

function ArrayItem({ defaultValue, onChange }) {
  const [head, jsonEditRef] = useRefs();

  function get() {
    return jsonEditRef.context.get();
  }

  function handleDelete() {
    head.current.remove();
    setTimeout(() => onChange(), 0);
  }

  return (
    <ArrayItem.Context.Provider value={{ get }} ref={head}>
      <div className="flex gap-x-2">
        <div>
          <button onClick={handleDelete} class="border rounded px-2 bg-red-50">
            Delete
          </button>
        </div>
        <JsonEdit
          defaultValue={defaultValue}
          onChange={onChange}
          ref={jsonEditRef}
        />
      </div>
    </ArrayItem.Context.Provider>
  );
}
ArrayItem.Context = createContext();
