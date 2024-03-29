import {
  usePropertyBoolean, useQuery, useStyleBoolean, combineHooks, useRefs,
  useMutation, useErrorMessage, useTextInput
} from './lib/domstatejsx';

const fakeApi = {
  messages: ['a@b.c', 'd@e.f'],
  get: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fakeApi.messages;
  },
  post: async (newMessage) => {
    if (newMessage.indexOf('@') === -1) {
      throw new Error('Invalid email address');
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    fakeApi.messages.push(newMessage);
  },
};

export default function App() {
  const [
    errorParagraph, newMessageInput, newMessageButton, fetchSpinner, messageList
  ] = useRefs();

  const [getNewMessageInput, setNewmessageInput] = useTextInput(newMessageInput);
  const [, setFetchLoading] = combineHooks(
    useStyleBoolean(messageList, 'display', 'none', null),
    useStyleBoolean(fetchSpinner, 'display', null, 'none'),
  );
  const [, setMutationLoading] = usePropertyBoolean(newMessageButton, 'disabled', true, false);
  const [, setErrorMessage] = useErrorMessage(errorParagraph);

  const { fetch } = useQuery({
    queryFn: fakeApi.get,
    onStart: () => setFetchLoading(true),
    onEnd: () => setFetchLoading(false),
    onSuccess: (data) => messageList.current.replaceChildren(
      ...data.map((message) => <li>{message}</li>)
    ),
  });

  const { mutate } = useMutation({
    queryFn: fakeApi.post,
    onStart: () => setMutationLoading(true),
    onEnd: () => setMutationLoading(false),
    onSuccess: () => {
      setErrorMessage(null);
      setNewmessageInput('');
      fetch();
    },
    onError: (error) => setErrorMessage(error.message),
  });

  async function handleNew(event) {
    event.preventDefault();
    if (!getNewMessageInput()) {
      setErrorMessage('This field is required');
      return;
    }
    await mutate(getNewMessageInput());
  }

  return (
    <>
      <form onSubmit={handleNew}>
        <p>New message: <input autoFocus ref={newMessageInput} /></p>
        <p style={{ display: 'none', color: 'red' }} ref={errorParagraph} />
        <p><button ref={newMessageButton}>Save</button></p>
      </form>
      <p ref={fetchSpinner}>Loading...</p>
      <ul style={{ display: 'none' }} ref={messageList} />
    </>
  );
}
