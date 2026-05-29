import { useForm, useRefProxy, useTextContent } from '../domstatejsx';
import Radio from './utils/Radio';

export default function App() {
  const refs = useRefProxy();
  const [, setPre] = useTextContent(refs.pre);

  const { registerForm, register, registerError } = useForm({
    onSuccess: async (data) => {
      setPre('Success: ' + JSON.stringify(data, null, 2));
    },
    onError: async (errors) => {
      setPre('Errors: ' + JSON.stringify(errors, null, 2));
    },
    validate: async ({ username, gender }) => {
      if (username === 'Bill' && gender === 'female') {
        throw new Error("Bill is a boy's name");
      }
    },
  });

  return (
    <>
      <form {...(registerForm() as any)}>
        <p>
          Username:{' '}
          <input
            autoFocus
            {...(register('username', { required: true }) as any)}
          />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...(registerError('username') as any)}
        />
        <p>
          Gender:{' '}
          <Radio
            options={[
              ['male', 'Male'],
              ['female', 'Female'],
            ]}
            {...(register('gender', { required: true }) as any)}
          />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...(registerError('gender') as any)}
        />
        <p
          style={{ display: 'none', color: 'red' }}
          {...(registerError() as any)}
        />
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
