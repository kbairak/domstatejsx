import { useForm, useRefs, useTextContent } from './lib/domstatejsx';

export default function App() {
  const [successMsg] = useRefs();
  const [, setSuccessMsg] = useTextContent(successMsg);

  const {
    handleSubmit,
    getData,
    register,
    registerError,
    registerButton,
    reset,
  } = useForm();

  return (
    <>
      <form
        onSubmit={handleSubmit(() => setSuccessMsg(JSON.stringify(getData())))}
      >
        <p>
          Full name:{' '}
          <input {...register('full_name', { required: true })} autoFocus />
        </p>
        <p style={{ color: 'red' }} {...registerError('full_name')} />
        <p>
          Username:
          <input
            {...register('username', {
              required: true,
              validate: (value) => /\s/.test(value) && 'Spaces are not allowed',
            })}
          />
        </p>
        <p style={{ color: 'red' }} {...registerError('username')} />
        <p>
          Password:
          <input
            type="password"
            {...register('password', { required: true })}
          />
        </p>
        <p style={{ color: 'red' }} {...registerError('password')} />
        <p>
          Email:
          <input
            type="email"
            {...register('email', {
              required: true,
              validate: (value) =>
                !/@/.test(value) && 'This is not a valid email address',
            })}
          />
        </p>
        <ul style={{ color: 'red' }} {...registerError('email')} />
        <p>
          <button {...registerButton()}>Save</button>
          <button type="button" onClick={() => reset()}>
            Reset
          </button>
        </p>
      </form>
      <pre ref={successMsg} />
    </>
  );
}
