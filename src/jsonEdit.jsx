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
  const [jsonEditRef, preRef] = useRefs();
  const [getJson, setJson] = useControlledInput(jsonEditRef);
  const [, setPre] = useTextContent(preRef);

  function renderPre(value = undefined) {
    setTimeout(() => {
      const serialized = JSON.stringify(
        value === undefined ? getJson() : value,
        null,
        2,
      );
      setPre(serialized);
    }, 0);
  }
  renderPre();

  return (
    <>
      <div class="flex gap-x-2">
        <button
          onClick={() => {
            setJson(null);
            renderPre();
          }}
          class="border rounded p-1 bg-blue-50"
        >
          Set null
        </button>
        <button
          onClick={() => {
            setJson('hello world');
            renderPre();
          }}
          class="border rounded p-1 bg-blue-50"
        >
          Set string
        </button>
        <button
          onClick={() => {
            setJson([1, 'two', 3, 'four']);
            renderPre();
          }}
          class="border rounded p-1 bg-blue-50"
        >
          Set array
        </button>
        <button
          onClick={() => {
            setJson({
              source_string: 'Hello world',
              source_language: 'en',
              target_language: 'el',
              glossary: [
                {
                  source: 'world',
                  pos: 'noun',
                  translation: 'κόσμος',
                },
              ],
              tm: [
                {
                  source: 'Hello Bill',
                  translation: 'Καλημέρα Bill',
                },
              ],
              industry: 'fintech',
              target_audience: 'young people',
            });
            renderPre();
          }}
          class="border rounded p-1 bg-blue-50"
        >
          Set prompt context
        </button>
      </div>
      <JsonEdit onChange={renderPre} ref={jsonEditRef} />
      <pre ref={preRef} />
    </>
  );
}

function JsonEdit({ onChange = () => { }, defaultValue = null }) {
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
    objectDivRef,
    objectListRef,
  ] = useRefs();

  const [getType, setType] = useTextInput(typeSelectRef);
  function get() {
    const type = getType();
    if (type === 'null') return null;
    else if (type === 'boolean') return getBoolean();
    else if (type === 'number') return getNumber();
    else if (type === 'string') return getString();
    else if (type === 'array') return getArray();
    else if (type === 'object') return getObject();
  }

  function set(value) {
    if (value === null) {
      setType('null');
      toggleVisible('null');
    } else if (typeof value === 'boolean') {
      setType('boolean');
      setBoolean(value);
      toggleVisible('boolean');
    } else if (typeof value === 'number') {
      setType('number');
      setNumber(value);
      toggleVisible('number');
    } else if (typeof value === 'string') {
      setType('string');
      setString(value);
      toggleVisible('string');
    } else if (Array.isArray(value)) {
      setType('array');
      setArray(value);
      toggleVisible('array');
    } else if (isObject(value)) {
      setType('object');
      setObject(value);
      toggleVisible('object');
    }
  }

  function getActiveInput() {
    const type = getType();
    if (type === 'number') return numberInputRef.current;
    else if (type === 'string') return stringInputRef.current;
  }

  function toggleVisible(type) {
    [
      ['null', () => { }],
      ['boolean', setBooleanVisible],
      ['number', setNumberVisible],
      ['string', setStringVisible],
      ['array', setArrayVisible],
      ['object', setObjectVisible],
    ].forEach(([t, setVisible]) => {
      setVisible(t === type);
    });
  }

  // Type
  function handleTypeChange(type) {
    if (type === 'null') {
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
    } else if (type === 'object') {
      setObject({});
      onChange({});
    }
    toggleVisible(type);
    getActiveInput()?.focus();
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
        onChange: () => onChange(items),
      })),
    );
  }
  function handleAddItemToArray() {
    addArrayItems({ defaultValue: '', onChange: () => onChange(getArray()) });
    onChange(getArray());
    getArrayRefs().at(-1)?.context?.focus();
  }

  // Object
  const [, setObjectVisible] = useClassBoolean(objectDivRef, null, 'hidden');
  const [getObjectRefs, addObjectItems, resetObjectItems] = useList(
    objectListRef,
    ObjectItem,
  );
  function getObject() {
    return Object.fromEntries(
      getObjectRefs().map(({ context: { get } }) => get()),
    );
  }
  function setObject(value) {
    resetObjectItems(
      ...Object.entries(value).map(([key, item]) => ({
        defaultKey: key,
        defaultValue: item,
        onChange: () => onChange(getObject()),
      })),
    );
  }
  function handleAddItemToObject() {
    addObjectItems({
      defaultKey: '',
      defaultValue: '',
      onChange: () => onChange(getObject()),
    });
    onChange(getObject());
    getObjectRefs().at(-1)?.context?.focus();
  }

  return (
    <JsonEdit.Context.Provider value={{ get, set, getActiveInput }}>
      <div class="flex gap-x-2 border border-gray-300 rounded p-1 m-1">
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
            <option value="object" selected={isObject(defaultValue)}>
              object
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
            class="border border-gray-300 rounded px-1"
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
            class="border border-gray-300 rounded px-1"
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
          <div ref={arrayListRef}>
            {Array.isArray(defaultValue) &&
              defaultValue.map((item) => (
                <ArrayItem defaultValue={item} onChange={onChange} />
              ))}
          </div>
          <button
            onClick={handleAddItemToArray}
            class="border rounded p-x-1 bg-blue-50"
          >
            Add
          </button>
        </div>

        {/* Object */}
        <div
          class={[
            'flex flex-col',
            ...(isObject(defaultValue) ? [] : ['hidden']),
          ].join(' ')}
          ref={objectDivRef}
        >
          <div ref={objectListRef}>
            {isObject(defaultValue) &&
              Object.entries(defaultValue).map(([key, value]) => (
                <ObjectItem
                  defaultKey={key}
                  defaultValue={value}
                  onChange={onChange}
                />
              ))}
          </div>
          <button
            onClick={handleAddItemToObject}
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

  function focus() {
    jsonEditRef.context.getActiveInput()?.focus();
  }

  function handleDelete() {
    head.current.remove();
    setTimeout(() => onChange(get()), 0);
  }

  return (
    <ArrayItem.Context.Provider value={{ get, focus }} ref={head}>
      <div class="flex gap-x-2">
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

function ObjectItem({ defaultKey, defaultValue, onChange }) {
  const [head, keyInputRef, jsonEditRef] = useRefs();

  const [getKey] = useTextInput(keyInputRef);

  function get() {
    return [getKey(), jsonEditRef.context.get()];
  }

  function focus() {
    keyInputRef.current.focus();
  }

  function handleDelete() {
    head.current.remove();
    setTimeout(() => onChange(get()), 0);
  }

  setTimeout(() => keyInputRef.current.focus(), 0);

  return (
    <ObjectItem.Context.Provider value={{ get, focus }} ref={head}>
      <div class="flex gap-x-2">
        <div>
          <button onClick={handleDelete} class="border rounded px-2 bg-red-50">
            Delete
          </button>
        </div>
        <div>
          <input
            value={defaultKey}
            onChange={() => onChange(get())}
            onKeyUp={() => onChange(get())}
            class="border border-gray-300 rounded px-1"
            ref={keyInputRef}
          />
        </div>
        <JsonEdit
          defaultValue={defaultValue}
          onChange={onChange}
          ref={jsonEditRef}
        />
      </div>
    </ObjectItem.Context.Provider>
  );
}
ObjectItem.Context = createContext();

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
