import { useForm, useRefProxy, useTextContent } from './lib/domstatejsx';
import Radio from './utils/Radio';

export default function App() {
  const refs = useRefProxy();
  const [, setPre] = useTextContent(refs.pre);

  const { registerForm, register, registerError } = useForm({
    onSuccess: (data) => setPre('Success: ' + JSON.stringify(data, null, 2)),
    onError: (errors) => setPre('Errors: ' + JSON.stringify(errors, null, 2)),
    validate: ({ username, gender }) => {
      if (username === 'Bill' && gender === 'female') {
        throw new Error("Bill is a boy's name");
      }
    },
  });

  return (
    <>
      <form {...registerForm()}>
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
            options={[
              ['male', 'Male'],
              ['female', 'Female'],
            ]}
            {...register('gender', { required: true })}
          />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('gender')}
        />
        <p style={{ display: 'none', color: 'red' }} {...registerError()} />
        <p>
          <button>Submit</button>
        </p>
      </form>
      <p>
        <pre ref={refs.pre} />
      </p>
    </>
  );
}
