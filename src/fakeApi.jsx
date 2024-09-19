import {
  useForm,
  useList,
  useMutation,
  usePropertyBoolean,
  useQuery,
  useRefProxy,
  useStyleBoolean,
} from './lib/domstatejsx';

const fakeApi = {
  messages: ['a@b.c', 'd@e.f'],
  get: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fakeApi.messages;
  },
  post: async (newMessage) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (newMessage.indexOf('@') === -1) {
      throw new Error('Invalid email address');
    }
    fakeApi.messages.push(newMessage);
  },
};

export default function App() {
  const refs = useRefProxy();

  const [, setQueryIsLoading] = useStyleBoolean(
    refs.loading,
    'display',
    null,
    'none',
  );
  const [, , resetMessages] = useList(refs.ul, (message) => <li>{message}</li>);
  const [, setFormIsLoading] = usePropertyBoolean(
    refs.submit,
    'disabled',
    true,
    false,
  );

  const { refetch } = useQuery({
    onStart: () => {
      setQueryIsLoading(true);
    },
    queryFn: fakeApi.get,
    onSuccess: (messages) => {
      resetMessages(...messages);
    },
    onEnd: () => setQueryIsLoading(false),
  });

  const { mutate } = useMutation({
    mutationFn: fakeApi.post,
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  const { registerForm, register, registerError, reset } = useForm({
    onStart: () => setFormIsLoading(true),
    onSubmit: ({ message }) => mutate(message),
    onEnd: () => setFormIsLoading(false),
  });

  return (
    <>
      <p style={{ display: 'none' }} ref={refs.loading}>
        Loading...
      </p>
      <ul ref={refs.ul} />
      <p>
        <button
          onClick={() => {
            resetMessages();
            refetch();
          }}
        >
          Refetch
        </button>
      </p>
      <form {...registerForm()}>
        <p>
          Message: <input {...register('message', { required: true })} />
        </p>
        <p style={{ display: 'none', color: 'red' }} {...registerError()} />
        <p
          style={{ display: 'none', color: 'red' }}
          {...registerError('message')}
        />
        <p>
          <button ref={refs.submit}>Submit</button>
        </p>
      </form>
    </>
  );
}
