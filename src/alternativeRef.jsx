import { useRefProxy, useTextContent } from './lib/domstatejsx';

export default function App() {
  const refs = useRefProxy();
  const [, setP] = useTextContent(refs.p);

  return (
    <>
      <p ref={refs.p} />
      <button onClick={() => setP('hello world')}>Fill in "hello world"</button>
    </>
  );
}
