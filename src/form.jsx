import {
  createContext,
  useForm,
  useRefs,
  useTextContent,
} from './lib/domstatejsx';

export default function App() {
  const [preRef] = useRefs();
  const [, setPre] = useTextContent(preRef);

  const { registerForm, register, registerError } = useForm({
    onSuccess: (data) => setPre('Success: ' + JSON.stringify(data, null, 2)),
    onError: (errors) => setPre('Errors: ' + JSON.stringify(errors, null, 2)),
  });

  return (
    <>
      <form
        {...registerForm({
          validate: ({ username, gender }) => {
            if (username === 'Bill' && gender === 'Female') {
              throw new Error("Bill is a boy's name");
            }
          },
        })}
      >
        <p style={{ display: 'none', color: 'red' }} {...registerError()} />
        <p>
          Username:{' '}
          <input autoFocus {...register('username', { required: true })} />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('username')}
        />
        <p>
          Gender:{' '}
          <Radio
            options={['Male', 'Female']}
            {...register('gender', { required: true })}
          />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('gender')}
        />
        <p>
          <button>Submit</button>
        </p>
      </form>
      <p>
        <pre ref={preRef} />
      </p>
    </>
  );
}

function Radio({ onChange, options }) {
  const refs = [];
  const ref = (r) => refs.push(r);

  function get() {
    const checkedRadio = refs.find((ref) => ref.current.checked);
    return checkedRadio?.current?.nextSibling?.textContent || null;
  }

  function set(value) {
    refs.forEach(({ current }) => (current.checked = false));
    const targetRadio = refs.find(
      (ref) => ref.current.nextSibling.textContent === value,
    );
    if (targetRadio) targetRadio.current.checked = true;
  }

  function handleClick(option) {
    set(option);
    onChange(option);
  }

  return (
    <Radio.Context.Provider value={{ get, set }}>
      {options.map((option) => (
        <label>
          <input type="radio" onClick={() => handleClick(option)} ref={ref} />
          {option}
        </label>
      ))}
    </Radio.Context.Provider>
  );
}
Radio.Context = createContext();
