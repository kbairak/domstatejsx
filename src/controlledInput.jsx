import {
  useTextContent,
  useControlledInput,
  useRefProxy,
} from './lib/domstatejsx';
import Radio from './utils/Radio';

export default function App() {
  const refs = useRefProxy();

  const [getRadio, setRadio] = useControlledInput(refs.radio);
  const [, setSpan] = useTextContent(refs.span);

  function refreshSpan() {
    setSpan(getRadio());
  }

  setTimeout(refreshSpan, 0);

  return (
    <>
      <Radio
        defaultValue={3}
        onChange={setSpan}
        options={[
          [0, 'Zero'],
          [1, 'One'],
          [2, 'Two'],
          [3, 'Three'],
        ]}
        ref={refs.radio}
      />
      <p>
        <button
          onClick={() => {
            setRadio(2);
            refreshSpan();
          }}
        >
          Select "two"
        </button>
      </p>
      <p>
        Selected Value: <span ref={refs.span} />
      </p>
    </>
  );
}
