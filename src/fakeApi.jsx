import {
  useForm,
  useList,
  useMutation,
  usePropertyBoolean,
  useQuery,
  useRefs,
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
  const [loadingRef, ulRef, submitRef] = useRefs();

  const [, setQueryIsLoading] = useStyleBoolean(
    loadingRef,
    'display',
    null,
    'none',
  );
  const [, , resetMessages] = useList(ulRef, ({ message }) => (
    <li>{message}</li>
  ));
  const [, setFormIsLoading] = usePropertyBoolean(
    submitRef,
    'disabled',
    true,
    false,
  );

  const { refetch } = useQuery({
    onStart: () => setQueryIsLoading(true),
    queryFn: fakeApi.get,
    onSuccess: (messages) => {
      resetMessages(...messages.map((message) => ({ message })));
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
    onSubmit: async ({ message }) => {
      setFormIsLoading(true);
      mutate(message);
    },
    onEnd: () => setFormIsLoading(false),
  });

  return (
    <>
      <p style={{ display: 'none' }} ref={loadingRef}>
        Loading...
      </p>
      <ul ref={ulRef} />
      <p>
        <button onClick={refetch}>Refetch</button>
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
          <button ref={submitRef}>Submit</button>
        </p>
      </form>
    </>
  );
}
