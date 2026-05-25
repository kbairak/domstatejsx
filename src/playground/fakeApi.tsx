import {
  useForm,
  useList,
  useMutation,
  usePropertyBoolean,
  useQuery,
  useRefProxy,
  useStyleBoolean,
} from '../domstatejsx';

const fakeApi = {
  messages: ['a@b.c', 'd@e.f'],
  get: async (): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fakeApi.messages;
  },
  post: async (newMessage: string): Promise<void> => {
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
  const [, , resetMessages] = useList(refs.ul, (message: string) => <li>{message}</li>);
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
      resetMessages();
      refetch();
    },
  });

  const { registerForm, register, registerError, reset } = useForm({
    onStart: async () => { setFormIsLoading(true); },
    onSubmit: async (data) => { await mutate(data.message); },
    onEnd: async () => { setFormIsLoading(false); },
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
      <form {...(registerForm() as any)}>
        <p>
          Message: <input {...(register('message', { required: true }) as any)} />
        </p>
        <p style={{ display: 'none', color: 'red' }} {...(registerError() as any)} />
        <p
          style={{ display: 'none', color: 'red' }}
          {...(registerError('message') as any)}
        />
        <p>
          <button ref={refs.submit}>Submit</button>
        </p>
      </form>
    </>
  );
}
