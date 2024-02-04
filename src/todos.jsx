import './tailwind.css';

import {
  combineHooks, createContext, useCheckbox, useClassBoolean, useContext,
  useIntContent, useRefs, useTextContent,
} from './lib/domstatejsx';

export default function App() {
  const [head, totalSpan, doneSpan, todoList] = useRefs();

  const [, setTotal] = useIntContent(totalSpan);
  const [, setDone] = useIntContent(doneSpan);

  function handleAdd(event) {
    event.preventDefault();
    const input = event.target['text'];
    if (!input.value) return;
    todoList.current.append(<Todo text={input.value} />);
    input.value = '';
    setTotal((prev) => prev + 1);
    save();
  }

  function onDelete(done) {
    setTotal((prev) => prev - 1);
    setDone((prev) => prev - Number(done));
  }

  function onDone(done) { setDone((prev) => prev + (done ? 1 : -1)); }

  function onToggleEdit(id) {
    useContext(head.current, Todo.Context, { direction: 'down' })
      .forEach(({ id: todoId, toggleForm }) => toggleForm(id === todoId ? null : false));
  }

  function save() {
    const data = useContext(todoList.current, Todo.Context, { direction: 'down' })
      .map(({ getText, isDone }) => ({ text: getText(), done: isDone() }));
    localStorage.setItem('todos', JSON.stringify(data));
  }

  setTimeout(() => {
    let data = localStorage.getItem('todos');
    if (!data) return;
    data = JSON.parse(data);
    todoList.current.replaceChildren(
      ...data.map(({ text, done }) => <Todo text={text} done={done} />)
    );
    setTotal(data.length);
    setDone(data.filter(({ done }) => done).length);
  }, 0);

  return (
    <App.Context.Provider value={{ onDelete, onDone, onToggleEdit, save }} ref={head}>
      <div class="max-w-[64rem] mx-auto">
        <h1 class="text-2xl">My Todo app</h1>
        <h2 class="text-xl">
          Summary {' '}
          <small>
            Total: <span ref={totalSpan}>0</span>, Done: <span ref={doneSpan}>0</span>
          </small>
        </h2>
        <form onSubmit={handleAdd} class="border rounded-md p-4 flex gap-x-8">
          <input name="text" autoFocus class="border border-slate-200 rounded" />
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

  const [getText, setText] = useTextContent(textSpan);
  const [isDone, setIsDone] = combineHooks(
    useCheckbox(doneCheckbox),
    useClassBoolean(textSpan, 'line-through', null),
  );

  const [, setIsEditing] = combineHooks(
    useClassBoolean(textSpan, 'hidden', null),
    useClassBoolean(textForm, null, 'hidden'),
    [, (value) => {
      if (value) {
        textInput.current.focus();
      }
    }],
  );

  function handleDone(event) {
    setIsDone(event.target.checked);
    const { onDone, save } = useContext(head.current, App.Context);
    onDone(event.target.checked);
    save();
  }

  function handleDelete() {
    const { onDelete, save } = useContext(head.current, App.Context);
    onDelete(isDone());
    head.current.remove();
    save();
  }

  const id = crypto.randomUUID();
  function handleToggleEdit() {
    const { onToggleEdit } = useContext(head.current, App.Context);
    onToggleEdit(id);
  }

  function toggleForm(value) {
    setIsEditing(value === null ? ((prev) => !prev) : value);
  }

  function handleEdit(event) {
    event.preventDefault();
    const input = event.target['text'];
    if (input.value) {
      setText(input.value);
      const { save } = useContext(head.current, App.Context);
      save();
    }
    setIsEditing(false);
  }

  return (
    <Todo.Context.Provider value={{ getText, isDone, id, toggleForm }} ref={head}>
      <li>
        <label class="flex gap-x-2 p-1 m-1 border rounded-sm">
          <div class="flex gap-x-3 px-2 border rounded-md divide-x">
            <input
              type="checkbox"
              checked={done}
              onChange={handleDone}
              ref={doneCheckbox}
            />
            <button onClick={handleDelete}>❌</button>
            <button onClick={handleToggleEdit}>✏️</button>
          </div>
          <span ref={textSpan} class={done ? 'line-through' : null}>
            {text}
          </span>
          <form onSubmit={handleEdit} ref={textForm} class="hidden flex gap-x-4">
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
