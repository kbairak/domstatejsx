import {
  useForm,
  usePropertyBoolean,
  useRefs,
  useTextContent,
} from './lib/domstatejsx';

export default function App() {
  const [submitRef, preRef] = useRefs();
  const [, setIsLoading] = usePropertyBoolean(
    submitRef,
    'disabled',
    true,
    false,
  );
  const [, setPre] = useTextContent(preRef);

  const { registerForm, register, registerError } = useForm({
    onSubmit: async () => {
      setIsLoading(true);
      setPre('Loading...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onError: (errors) => {
      setPre('Errors: ' + JSON.stringify(errors));
    },
    onSuccess: (data) => {
      setPre('Success: ' + JSON.stringify(data));
    },
    onEnd: () => {
      setIsLoading(false);
    },
  });

  return (
    <>
      <form {...registerForm()}>
        <p>
          Username: <input {...register('username', { required: true })} />
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('username')}
        />
        <p>
          <>
            Gender:{' '}
            <select {...register('gender', { required: true })}>
              <option />
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </>
        </p>
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('gender')}
        />
        <button ref={submitRef}>Submit</button>
      </form>
      <div>
        <pre ref={preRef} />
      </div>
    </>
  );
}
