import './tailwind.css';

import {
  combineHooks,
  createContext,
  useCheckbox,
  useClassBoolean,
  useContext,
  useIntContent,
  useRefs,
  useTextContent,
  useList,
} from './lib/domstatejsx';

export default function App() {
  const [totalSpan, doneSpan, todoList] = useRefs();

  const [, setTotal] = useIntContent(totalSpan);
  const [, setDone] = useIntContent(doneSpan);

  const [getTodos, addTodos] = combineHooks(
    useList(todoList, Todo),
    [, (...args) => setTotal((prev) => prev + args.length)],
    [
      ,
      (...args) =>
        setDone((prev) => prev + args.filter(({ done }) => done).length),
    ],
    [, save],
  );

  function handleAdd(event) {
    event.preventDefault();
    const input = event.target['text'];
    if (!input.value) return;
    addTodos({ text: input.value });
    input.value = '';
  }

  function onDelete(wasDone) {
    setTotal((prev) => prev - 1);
    setDone((prev) => prev - (wasDone ? 1 : 0));
  }

  function onDone(done) {
    setDone((prev) => prev + (done ? 1 : -1));
  }

  function onToggleEdit(id) {
    getTodos().forEach(({ context: { id: todoId, toggleForm } }) =>
      toggleForm(id === todoId ? null : false),
    );
  }

  function save() {
    localStorage.setItem(
      'todos',
      JSON.stringify(
        getTodos().map(({ context: { getText, isDone } }) => ({
          text: getText(),
          done: isDone(),
        })),
      ),
    );
  }

  setTimeout(() => {
    let data = localStorage.getItem('todos');
    if (!data) return;
    addTodos(...JSON.parse(data));
  }, 0);

  return (
    <App.Context.Provider value={{ onDelete, onDone, onToggleEdit, save }}>
      <div class="max-w-[64rem] mx-auto">
        <h1 class="text-2xl">My Todo app</h1>
        <h2 class="text-xl">
          Summary{' '}
          <small>
            Total: <span ref={totalSpan}>0</span>, Done:{' '}
            <span ref={doneSpan}>0</span>
          </small>
        </h2>
        <form onSubmit={handleAdd} class="border rounded-md p-4 flex gap-x-8">
          <input
            name="text"
            autoFocus
            class="border border-slate-200 rounded"
          />
          <button class="border px-6 rounded-md bg-blue-200">Add</button>
        </form>
        <ul ref={todoList} class="py-4" />
      </div>
    </App.Context.Provider>
  );
}
App.Context = createContext();

function Todo({ text, done = false }) {
  const [head, doneCheckbox, textSpan, textForm, textInput] = useRefs();
  const id = crypto.randomUUID();

  const [, setIsEditing] = combineHooks(
    useClassBoolean(textSpan, 'hidden', null),
    useClassBoolean(textForm, 'flex', 'hidden'),
    [
      ,
      (value) => {
        if (value) textInput.current.focus();
      },
    ],
  );

  const [getText, setText] = combineHooks(
    useTextContent(textSpan),
    [, () => useContext(head.current, App.Context).save()],
    [, () => setIsEditing(false)],
  );

  const [isDone, setIsDone] = combineHooks(
    useCheckbox(doneCheckbox),
    useClassBoolean(textSpan, 'line-through', null),
    [
      ,
      (value) => {
        const { onDone, save } = useContext(head.current, App.Context);
        onDone(value);
        save();
      },
    ],
  );

  function handleDelete() {
    const { onDelete, save } = useContext(head.current, App.Context);
    onDelete(isDone());
    head.current.remove();
    save();
  }

  function handleToggleEdit() {
    useContext(head.current, App.Context).onToggleEdit(id);
  }

  function toggleForm(value) {
    setIsEditing(value === null ? (prev) => !prev : value);
  }

  function handleSubmitEdit(event) {
    event.preventDefault();
    const input = event.target['text'];
    if (!input.value) return;
    setText(input.value);
  }

  return (
    <Todo.Context.Provider
      value={{ getText, isDone, id, toggleForm }}
      ref={head}
    >
      <li>
        <label class="flex gap-x-2 p-1 m-1 border rounded-sm">
          <div class="flex gap-x-3 px-2 border rounded-md divide-x">
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setIsDone(e.target.checked)}
              ref={doneCheckbox}
            />
            <button onClick={handleDelete}>❌</button>
            <button onClick={handleToggleEdit}>✏️</button>
          </div>
          <span ref={textSpan} class={done ? 'line-through' : null}>
            {text}
          </span>
          <form
            onSubmit={handleSubmitEdit}
            ref={textForm}
            class="hidden gap-x-4"
          >
            <input
              name="text"
              value={text}
              ref={textInput}
              class="border rounded-sm px-1"
            />
            <button class="border px-6 rounded-md bg-blue-200">Save</button>
          </form>
        </label>
      </li>
    </Todo.Context.Provider>
  );
}
Todo.Context = createContext();
