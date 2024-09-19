# Overview

`domstatejsx` is a web frontend library that allows building applications with
the following features:

1. Render DOM elements with JSX
2. Keep your application's state in the DOM. No need to constantly react to
   state changes by re-rendering parts of your application
3. Structure your application with (reusable) components that contain their
   behaviour and expose methods so that they can be interacted with

# Installation - setup

```sh
npm install --save domstatejsx
```

If you are running a [vite](https://vitejs.dev/) project you have the following
options to enable JSX:

1. Use the vite plugin:

   ```javascript
   // vite.config.js
   import domstatejsxPlugin from 'domstatejsx/vite-plugin';

   export default {
     plugins: [domstatejsxPlugin()],
     // ...
   };
   ```

2. Setup the `esbuild` option:

   ```javascript
   // vite.config.js
   export default {
     esbuild: {
       jsx: 'automatic',
       jsxImportSource: 'domstatejsx',
     },
     // ...
   };
   ```

3. Include this in every .jsx file you want `domstatejsx` to take over handling
   of JSX:

   ```javascript
   import { createElement, Fragment } from 'domstatejsx';
   /** @jsx createElement */
   /** @jsxFragment Fragment */
   ```

# Quickstart

Your first application can look like this:

```javascript
document.body.append(<h1>hello world</h1>);
```

JSX expressions return native DOM elements. The above is roughly equivalent to:

```javascript
const element = document.createElement('h1');
element.textContent = 'hello world';
document.body.append(element);
```

JSX expressions can also render components, which are simply functions that
return DOM elements:

```javascript
function Counter() {
  return (
    <>
      <div>
        <button>Click me</button>
      </div>
      <div>
        Count: <span>0</span>
      </div>
    </>
  );
}

document.body.append(<Counter />);
```

> **Note:**
>
> In React, there is a difference between `<Counter />` and `Counter()`. As a
> function, `Counter` may return JSX but React makes a note that the first
> invocation mounts a component to the DOM and maintains its lifecycle (with hooks
> etc). In domstatejsx, there is no difference; you could have written the above
> like this and it would have made no difference:
>
> ```javascript
> document.body.append(Counter());
> ```

## Managing state

Where will we put our state variables? The answer is: the `span` element itself!

```javascript
function Counter() {
  const countSpan = <span>0</span>;

  function handleClick() {
    const prevValue = parseInt(countSpan.textContent);
    countSpan.textContent = `$(prevValue + 1)`;
  }

  return (
    <>
      <div>
        <button onClick={handleClick}>Click me</button>
      </div>
      <div>Count: {span}</div>
    </>
  );
}

document.body.append(<Counter />);
```

If we want to keep a part of the returned DOM to a variable, like we did here,
we can use `ref`s. They work similarly to React; the DOM element is assigned to
the `.current` attribute of the `ref`.

```javascript
function Counter() {
  const countSpanRef = {};

  function handleClick() {
    const prevValue = parseInt(countSpanRef.current.textContent);
    countSpanRef.current.textContent = `$(prevValue + 1)`;
  }

  return (
    <>
      <div>
        <button onClick={handleClick}>Click me</button>
      </div>
      <div>
        Count: <span ref={countSpanRef}>0</span>
      </div>
    </>
  );
}

document.body.append(<Counter />);
```

> When a `ref` prop is encountered in JSX, the produced DOM element will be added as the
> `current` property of the "ref". The previous snippet is roughly equivalent to:
>
> ```javascript
> function Counter() {
>   function handleClick() {
>     // ...
>   }
>
>   const countSpanRef = { current: <span>0</span> };
>   return (
>     <>
>       <div>
>         <button onClick={handleClick}>Click me</button>
>       </div>
>       <div>Count: {countSpanRef.current}</div>
>     </>
>   );
> }
> ```

Since you will want to use refs a lot, there are helper function to create them:

### `useRefs`

```javascript
const [ref1, ref2, ref3] = useRefs();

// Rougly equivalent to

const [ref1, ref2, ref3] = [{}, {}, {}];
```

_(refs are simply empty objects, `useRefs` returns an endless list of refs)_

### `useRefProxy`

`useRefProxy` creates refs lazily by using
[Proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

```diff
 function Counter() {
-  const countSpanRef = {};
+  const refs = useRefProxy();

   function handleClick() {
-    const prevValue = parseInt(countSpanRef.current.textContent);
+    const prevValue = parseInt(refs.countSpan.current.textContent);
-    countSpanRef.current.textContent = `$(prevValue + 1)`;
+    refs.countSpan.current.textContent = `$(prevValue + 1)`;
   }

   return (
     <>
       <div>
         <button onClick={handleClick}>Click me</button>
       </div>
       <div>
-        Count: <span ref={countSpanRef}>0</span>
+        Count: <span ref={refs.countSpan}>0</span>
       </div>
     </>
   );
 }
```

## Changing the DOM through refs

Because we will be using refs to modify the DOM a lot, here is a helper "hook":

```diff
 function Counter() {
   const refs = useRefProxy();
+  const [getCount, setCount] = useIntContent(refs.countSpan);

   function handleClick() {
-    const prevValue = parseInt(refs.countSpan.current.textContent);
+    const prevValue = getCount();
-    refs.countSpan.current.textContent = `$(prevValue + 1)`;
+    setCount(prevValue + 1);
   }

   return (
     // ...
   );
 }
```

Or simpler:

```diff
 function Counter() {
   const refs = useRefProxy();
-  const [getCount, setCount] = useIntContent(refs.countSpan);
+  const [, setCount] = useIntContent(refs.countSpan);

   function handleClick() {
-    const prevValue = getCount();
-    setCount(prevValue + 1)
+    setCount((prev) => prev + 1);
   }

   return (
     // ...
   );
 }
```

We have a lot of hooks like `useIntContent` that simplify inspecting and
modifying DOM elements; feel free to look them up in the
[API reference](#api-reference) section.

## How components communicate with each other

Because component functions return simple DOM elements, it's hard to think of
them as "alive", as if we are able to interact with them after they are
created. We have several options in order to achieve this, including ref contexts,
context lookup and callbacks. We will talk about two scenarios:

- A child component wants to invoke an action on a parent component, ie _upwards_
- A parent component wants to invoke an action on a child component, ie _downwards_

### Upwards, with callbacks

You can interact with parent components with callbacks. Let's consider this:

```javascript
export default function App() {
  return (
    <>
      <span>0</span>
      <ButtonContainer />
    </>
  );
}

function ButtonContainer() {
  return <button>Click me</button>;
}
```

Lets add a function that increments the counter in the parent component:

```diff
 export default function App() {
+  const refs = useRefProxy();
+  const [, setCount] = useIntContent(refs.span);
+
+  function increment() {
+    setCount((prev) => prev + 1);
+  }

   return (
     <>
-      <span>0</span>
+      <span ref={refs.span}>0</span>
       <ButtonContainer />
     </>
   );
 }

 function ButtonContainer() {
   return (
     <button>Click me</button>
   );
 }
```

And pass it as a prop to the child component

```diff
 export default function App() {
   const refs = useRefProxy();
   const [, setCount] = useIntContent(refs.span);

   function increment() {
     setCount((prev) => prev + 1);
   }

   return (
     <>
       <span ref={refs.span}>0</span>
-      <ButtonContainer />
+      <ButtonContainer onClick={increment} />
     </>
   );
 }

-function ButtonContainer() {
+function ButtonContainer({ onClick }) {
   return (
-    <button>Click me</button>
+    <button onClick={onClick}>Click me</button>
   );
 }
```

### Upwards, with context lookup

Alternatively you can find a parent component's context in order to interact with it.
Lets start by having the parent component _expose_ its context.

```diff
 export default function App() {
   const refs = useRefProxy();
   const [, setCount] = useIntContent(refs.span);

   function increment() {
     setCount((prev) => prev + 1);
   }

   return (
-    <>
+    <App.Context.Provider value={{ increment }}>
       <span ref={refs.span}>0</span>
       <ButtonContainer />
-    </>
+    </App.Context.Provider>
   );
 }
+App.Context = createContext();

 function ButtonContainer() {
   return (
     <button>Click me</button>
   );
 }
```

Then, you can _find_ the context from the child component:

```diff
 export default function App() {
   // ...
 App.Context = createContext();

 function ButtonContainer() {
+  const refs = useRefProxy();
+
+  function handleClick() {
+    const { increment } = useContext(refs.head.current, App.Context);
+    increment();
+  }

   return (
-    <button>Click me</button>
+    <button onClick={handleClick} ref={refs.head}>Click me</button>
   );
 }
```

The context gets attached to the DOM. This is why `useContext` must use a DOM
element as the first argument to use as the starting point for its search. Then
it goes "up" until it finds a node with an `App.Context` context associated
with it and returns its value.

### Downwards, accessing context through a _ref_

Lets reverse our example:

```javascript
export default function App() {
  return (
    <>
      <Counter />
      <button>Click me</button>
    </>
  );
}

function Counter() {
  return <span>0</span>;
}
```

We will start by having the child component expose its functionality through context:

```diff
 export default function App() {
   return (
     <>
       <Counter/>
       <button>Click me</button>
     </>
   );
 }

 function Counter() {
+  const refs = useRefProxy();
+  const [, setSpan] = useIntContent(refs.span);

+  function increment() {
+    setSpan((prev) => prev + 1);
+  }

   return (
+    <Counter.Context.Provider value={{ increment }}>
-      <span>0</span>
+      <span ref={refs.span}>0</span>
+    </Counter.Context.Provider>
   );
 }
+Counter.Context = createContext();
```

Then, the parent component can attach a _ref_ to the child component and access its
context:

```diff
 export default function App() {
+  const refs = useRefProxy();

+  function handleClick() {
+    refs.counter.context.increment()
+  }

   return (
     <>
-      <Counter/>
+      <Counter ref={refs.counter}/>
-      <button>Click me</button>
+      <button onClick={handleClick}>Click me</button>
     </>
   );
 }

 function Counter() {
   // ...
 }
 Counter.Context = createContext();
```

### Downwards, with context lookup

You can also search for context _downwards_. This is especially helpful if you want to
affect many child components at the same time:

```javascript
export default function App() {
  return (
    <>
      <Counter />
      <Counter />
      <Counter />
      // ...
      <button>Click me</button>
    </>
  );
}

function Counter() {
  // ...
}
Counter.Context = createContext();
```

```diff
 export default function App() {
+  const refs = useRefProxy();

+  function handleClick() {
+    useContext(refs.head.current, Counter.Counter, { direction: 'down' }).forEach(
+      ({ increment }) => increment(),
+    );
+  }

   return (
-    <>
+    <div ref={refs.head}>
       <Counter/>
       <Counter/>
       <Counter/>
       // ...
-      <button>Click me</button>
+      <button onClick={handleClick}>Click me</button>
-    </>
+    </div>
   );
 }

 function Counter() {
   // ...
 }
 Counter.Context = createContext();
```

`useContext` with the `{ direction: 'down' }` option searches the DOM under the starting
node and returns a list of found contexts.

## Other utilities

Some small utilities have been developed that take inspiraction from popular
React libraries that facilitate aspects of frontend development. They were
implemented mainly as proofs-of-concept for the functionality they provide:

### Queries

`useQuery` and `useMutation` can be used to manage interacting with remote
APIs. Their design has been inspired by the
[react-query](https://react-query-v3.tanstack.com/) library.

`useQuery` accepts the following properties:

- `onStart`: function that runs when the query begins
- `queryFn`: an async function that returns the remote data
- `onSuccess`: function that runs after a successful fetching; it receives the
  fetched data
- `onError`: function that runs after a failed fetching; it receives the error
  object
- `onEnd`: function that runs when the query ends, regardless of whether the
  fetching was successful or not
- `enabled`: boolean (default true), determines if the query will run once the
  moment it is defined

`useQuery` returns a query object with a `refetch` method you can use to trigger
a fetch operation. The arguments to `refetch` will be passed on to `queryFn`.

Sample usage:

```javascript
function App() {
  const refs = useRefProxy();
  const [, setIsLoading] = usePropertyBoolean(refs.button, 'disabled', true, false);
  const [, setParagraph] = useTextContent(refs.paragraph);

  const { refetch } = useQuery({
    queryFn: async () => {
      const response = await fetch(...);
      return await response.json();
    },
    onStart: () => {
      setParagraph('');
      setIsLoading(true);
    },
    onEnd: () => setIsLoading(false),
    onSuccess: ({ message }) => setParagraph(message),
    onError: () => setParagraph('Something went wrong'),
  });

  return (
    <>
      <p ref={refs.paragraph} />
      <button onClick={refetch} ref={refs.button}>Refetch</button>
    </>
  );
}
```

`useMutation` accepts the following properties:

- `onStart`: function that runs when the mutation begins
- `mutationFn`: an async function that performs the mutation to the remote API
- `onSuccess`: function that runs after a successful mutation; it receives the remote
  server's response
- `onError`: function that runs after a failed mutation; it receives the error object
- `onEnd`: function that runs when the mutation ends, regardless of whether the mutation
  was successful or not

`useMutation` returns a mutation object with a `mutate` method you can use to
trigger a mutation. The arguments to `mutate` will be passed on to
`mutationFn`.

Sample usage:

```javascript
function App() {
  const [input, button, paragraph] = useRefs();
  const [getInput, setInput] = useTextInput(input);
  const [, setIsLoading] = usePropertyBoolean(button, 'disabled', true, false);
  const [, setParagraph] = useTextContent(paragraph);

  const { mutate } = useMutation({
    mutationFn: () => fetch(...),
    onStart: () => setIsLoading(true),
    onEnd: () => setIsLoading(false),
    onSuccess: () => setParagraph('Saved'),
    onError: () => setParagraph('Something went wrong'),
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await mutate(getInput());
    setInput('');
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input ref={input} />
        <button ref={button}>Save</button>
      </form>
      <p ref={paragraph} />
    </>
  );
}
```

### Forms

The `useForm` hook is heavily inspired by
[react-hook-form](https://react-hook-form.com/). The idea is that you create a
form object before rendering and then insert its `register` method into inputs
you want to control with the form. You also get:

- a `registerForm` function to insert into the `<form>` element to intercept its
  submission
- a `registerError` function to insert into DOM elements you want validation errors to
  appear in
- `reset` which you can invoke to reset all inputs to their default value

Here it is in action:

```javascript
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
```

### Routing

The `Route` and `Link` components is inspired by
[react-router](https://reactrouter.com). Each `Route` accepts a `path` property
and either an `element` function or a function inserted as children. It will
then render this element (or children) if the browser's path matches the
component's path. If the path has a parameter (eg `/pages/:page`), the value of
that parameter will be used as the props of the component.

`Link` accepts a `to` property and renders a button that will navigate you to
that (absolute) path.

If a path is not found, the closest parent `Route` with a `NotFound` property
will render the `NotFound` property.

Here it is in action:

```javascript
export default function App() {
  return (
    <Route path="" NotFound={() => <h1>Page not found</h1>}>
      {() => (
        <>
          <div>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/pages">Pages</Link>
          </div>
          <Route path="/" end>
            {() => <h1>This is home</h1>}
          </Route>
          <Route path="/about" end>
            {() => <h1>This is about</h1>}
          </Route>
          <Route path="/pages">
            {() => (
              <>
                <h1>This is pages</h1>
                <div>
                  <Link to="/pages/1">1</Link>
                  <Link to="/pages/2">2</Link>
                  <Link to="/pages/3">3</Link>
                </div>
                <Route path="/:page" end>
                  {({ page }) => <h1>This is page {page}</h1>}
                </Route>
              </>
            )}
          </Route>
        </>
      )}
    </Route>
  );
}
```

### Controlled Inputs

Writing controlled inputs is a bit harder than doing so in React. A _controlled input_
is an input element that can be manipulated by the browser and **also** by external
code. The recommended way to do so in domstatejsx is:

1. Write a component that accepts an `onChange` callback.

   ```javascript
   function Radio({ onChange, options }) {
     return (
       <>
         {options.map((option) => (
           <label>
             <input type="radio" />
             {option}
           </label>
         ))}
       </>
     );
   }
   ```

2. Have this component expose `get` and `set` functions with context

   ```diff
    function Radio({ onChange, options }) {
   +  const refs = []
   +  const ref = (r) => refs.push(r);

   +  function get() {
   +    // Remember, our "state" lives in the DOM
   +    return refs.find(
   +      ({ current: { checked } }) => checked,
   +    ).current.nextSibling.textContent;
   +  }

   + function set(value) {
   +   refs.forEach(({ current }) => { current.checked = false; });
   +   refs.find(
   +     ({ current }) => current.nextSibling.textContent === value,
   +   ).current.checked = true;
   + }

      return (
   -    <>
   +    <Radio.Context.Provider value={{ get, set }}>
         {options.map((option) => (
           <label>
   -         <input type="radio" />
   +         <input type="radio" ref={ref} />
             {option}
           </label>
         ))}
   -    </>
   +    </Radio.Context.Provider>
      );
    }
   +Radio.Context = createContext();
   ```

3. From inside a component, invoke `onChange` when the value is changed by the browser

   ```diff
    function Radio({ onChange, options }) {
      const refs = []
      const ref = (r) => refs.push(r);

      function get() {
        // Remember, our "state" lives in the DOM
        return refs.find(
          ({ current: { checked } }) => checked,
        ).current.nextSibling.textContent;
      }

     function set(value) {
       refs.forEach(({ current }) => { current.checked = false; });
       refs.find(
         ({ current }) => current.nextSibling.textContent === value,
       ).current.checked = true;
     }

   + function handleClick(option) {
   +   set(option);  // Do this in order to reset the checked status of other radios
   +   onChange(option);
   + }

      return (
        <Radio.Context.Provider value={{ get, set }}>
         {options.map((option) => (
           <label>
   -         <input type="radio" ref={ref} />
   +         <input type="radio" onClick={() => handleClick(option)} ref={ref} />
             {option}
           </label>
         ))}
        </Radio.Context.Provider>
      );
    }
   +Radio.Context = createContext();
   ```

4. Render this component and keep a ref pointing to it

   ```javascript
   export default function App() {
     const [inputRef] = useRefs();

     return (
       <>
         <Radio options={['Zero', 'One', 'Two', 'Three']} ref={inputRef} />
       </>
     );
   }
   ```

5. Use the `useControlledInput` hook on this ref

   ```diff
   +import { useControlledInput } from 'domstatejsx';

    export default function App() {
      const [inputRef] = useRefs();

   +  const [get, set] = useControlledInput(inputRef)

      return (
        <>
          <Radio
            options={['Zero', 'One', 'Two', 'Three']}
            ref={inputRef}
          />
        </>
      );
    }
   ```

6. Make the `onChange` callback call the setter returned by the hook

   ```diff
    export default function App() {
      const [inputRef] = useRefs();

      const [get, set] = useControlledInput(inputRef)

      return (
        <>
          <Radio
            options={['Zero', 'One', 'Two', 'Three']}
   +        onChange={set}
            ref={inputRef}
          />
        </>
      );
    }
   ```

Now we can control this input from outside:

```javascript
export default function App() {
  const [inputRef, spanRef] = useRefs();

  const [, set] = combineHooks(
    useControlledInput(inputRef),
    useTextContent(spanRef),
  );

  return (
    <>
      <Radio
        defaultValue="Three"
        onChange={set}
        options={['Zero', 'One', 'Two', 'Three']}
        ref={inputRef}
      />
      <p>
        <button onClick={() => set('Two')}>Select "two"</button>
      </p>
      <p>
        Selected Value: <span ref={spanRef} />
      </p>
    </>
  );
}
```

In this example, when the selection is changed, the 'span' is updated to reflect the
change. We can also change the radio's selection by clicking the button.

# Testing

You can test domstatejsx components using [vitest](https://vitejs.dev/) and
[@testing-library/dom](https://testing-library.com/docs/dom-testing-library/intro).

1. Install the packages:

   ```sh
   npm install --save-dev @testing-library/dom jsdom vitest
   ```

2. Add the following to `vite.config.js`:

   ```javascript
   export default {
     // ...
     test: {
       globals: true,
       environment: 'jsdom',
     },
   };
   ```

3. Create your test files ending in `.test.jsx`.

4. Run the tests with

   ```sh
   npx vitest
   ```

   or add a test script to `package.json`

   ```json
   {
     ...
     "scripts": {
       "test": "vitest"
     }
   }
   ```

   and run with

   ```sh
   npm run test
   ```

Lets pretend we want to test this simple component:

```javascript
// counter.jsx

import { useIntContent, useRefs } from 'domstatejsx';

export default function Counter() {
  const [spanRef] = useRefs();
  const [, setCount] = useIntContent(spanRef);

  return (
    <>
      <div>
        <button onClick={() => setCount((p) => p + 1)}>ClickMe</button>
      </div>
      <div>
        <span ref={spanRef}>0</span>
      </div>
    </>
  );
}
```

We can do it like this:

```javascript
import { fireEvent, screen } from '@testing-library/dom';
import { afterEach, expect } from 'vitest';

import Counter from './counter';

afterEach(() => {
  document.body.replaceChildren();
});

test('Renders a counter', () => {
  document.body.append(<Counter />);

  expect(screen.queryByText('ClickMe')).not.toBeNull();
  expect(screen.queryByText('0')).not.toBeNull();
});

test('Clicking increments counter', () => {
  document.body.append(<Counter />);

  fireEvent(screen.getByText('ClickMe'), new MouseEvent('click'));

  expect(screen.queryByText('0')).toBeNull();
  expect(screen.getByText('1')).not.toBeNull();
});

test('Clicking twice increments counter twice', () => {
  document.body.append(<Counter />);

  [...Array(2)].map(() => {
    fireEvent(screen.getByText('ClickMe'), new MouseEvent('click'));
  });

  expect(screen.queryByText('0')).toBeNull();
  expect(screen.queryByText('1')).toBeNull();
  expect(screen.queryByText('2')).not.toBeNull();
});
```

# API reference

## "Hooks"

- `useRefs` is a function that returns an endless list of "empty refs", which
  are simply empty javascript objects. The following are roughly equivalent:

  ```javascript
  const [a, b, c] = [{}, {}, {}];
  ```

  ```javascript
  const [a, b, c] = useRefs();
  ```

  The `ref` property in JSX will instruct the renderer to assign the resulting
  DOM element to the `.current` field of the ref. So, the following are
  equivalent:

  ```javascript
  function Timer() {
    const [numSpan] = useRefs();
    const span = <span>0</span>;
    numSpan.current = span;
    return <h1>{span} seconds since start</h1>;
  }
  ```

  ```javascript
  function Timer() {
    const [numSpan] = useRefs();
    return (
      <h1>
        <span ref={numSpan}>0</span> seconds since start
      </h1>
    );
  }
  ```

- `useIntContent` receives a ref as an argument and returns 2 functions: a
  getter and a setter. The getter returns the content of the element in integer
  format and the setter receives a number and sets it as the content of the
  element. The setter can also receive a function in order to perform
  incremental changes.

Here is the full list of hooks:

- `useTextContent`: Inspect/modify the text content of an element

  ```javascript
  function App() {
    const [textHeader] = useRefs();
    const [, setText] = useTextContent(textHeader);
    setInterval(() => {
      setText((prev) => prev + ' and on');
    }, 1000);
    return <h1 ref={textHeader}>Time goes on</h1>;
  }
  ```

- `useCheckbox`: Inspect/modify the "checked" status of a checkbox

  ```javascript
  function App() {
    const [checkbox] = useRefs();
    const [isChecked] = useCheckbox(); // A setter is also returned but we don't use it

    function handleClick() {
      alert(`The checkbox is ${isChecked() ? '' : 'not'} checked`);
    }

    return (
      <>
        <div>
          <input type="checkbox" ref={checkbox} />
        </div>
        <div>
          <button onClick={handleClick}>ClickMe</button>
        </div>
      </>
    );
  }
  ```

- `useTextInput`: Inspect/modify the value of a text input

  ```javascript
  function App() {
    const [textInput] = useRefs();
    const [getText] = useTextInput(textInput); // A setter is also returned but we don't use it

    function handleClick() {
      alert(`Hello ${getText()}`);
    }

    return (
      <>
        <div>
          <input value="world" ref={textInput} />
        </div>
        <div>
          <button onClick={handleClick}>ClickMe</button>
        </div>
      </>
    );
  }
  ```

- `useErrorMessage`: This works like `useTextContent`, but will also make sure
  the whole element becomes hidden when the setter's argument is falsy

  ```javascript
  function App() {
    const [textInput, errorDiv] = useRefs();
    const [getText] = useTextInput(textInput); // A setter is also returned but we don't use it
    const [, setError] = useErrorMessage(errorDiv);

    function handleClick() {
      if (getText().indexOf('@') === -1) {
        setError('Not a valid email address');
      } else {
        setError(null);
      }
    }

    return (
      <>
        <div>
          <input ref={textInput} />
        </div>
        <div style={{ display: 'none' }} ref={errorDiv} />
      </>
    );
  }
  ```

- `useStyleBoolean`: This toggles a style property between two values. The
  signature of the hook is:
  `useStyleBoolean(ref, property, onValue, offValue)`. The getter tells us if
  the style `property`'s value matches the `onValue` and the getter receives a
  boolean and sets the `property`'s value to `onValue` or `offValue`.

  ```javascript
  function App() {
    const [span] = useRefs();
    const [, setLineThrough] = useStyleBoolean(
      span,
      'text-decoration',
      'line-through',
      null,
    );

    function handleCheck(event) {
      setLineThrough(event.target.checked);
    }

    return (
      <>
        <span ref={span}>Hello world</span>
        <input type="checkbox" onChange={handleCheck} />
      </>
    );
  }
  ```

- `usePropertyBoolean`: This works like `useStyleBoolean` but for generic HTML
  properties:

  ```javascript
  function App() {
    const [button] = useRefs();
    const [, setLoading] = usePropertyBoolean(button, 'disabled', true, false);

    async function handleClick() {
      setLoading(true);
      await fetch(...);
      setLoading(false);
    }

    return (
      <button onClick={handleClick} ref={button}>Download stuff</button>
    );
  }
  ```

- `useClassBoolean`: This works like `useStyleBoolean` but for HTML classes
  (for this example assume we are using tailwind CSS):

  ```javascript
  function App() {
    const [span] = useRefs();
    const [, setLineThrough] = useClassBoolean(span, 'line-through', null);

    function handleCheck(event) {
      setLineThrough(event.target.checked);
    }

    return (
      <>
        <span ref={span}>Hello world</span>
        <input type="checkbox" onChange={handleCheck} />
      </>
    );
  }
  ```

- `useList`: This accepts a ref and a function. The setter adds new child
  elements to the element bound to the ref by invoking the function with the
  arguments to the setter (which also supports variable argument length). The
  getter returns refs for all the items that have been added by the setter:

  ```javascript
  function App() {
    const [textInput, todoList] = useRefs();
    const [getText, setText] = useTextInput(textInput);
    const [getTodos, addTodo] = useList(todoList, ({ text }) => (
      <li>{text}</li>
    ));

    function handleSubmit(event) {
      event.preventDefault();
      if (!getText()) return;
      addTodo({ text: getText() });
      setText('');
    }

    function showSummary() {
      alert(
        JSON.stringify(getTodos().map(({ current }) => current.textContent)),
      );
    }

    return (
      <>
        <form onSubmit={handleSubmit}>
          <input ref={textInput} />
          <button>Add</button>
        </form>
        <ul ref={todoList} />
        <button onClick={showSummary}>Show summary</button>
      </>
    );
  }
  ```

  _(This will make more sense once we talk about contexts later on)_

- `combineHooks`: This accepts other hooks (or any getter/setter pair) and
  returns a single getter/setter pair. The combined getter simply returns the
  return value of the first hook and the combined setter invokes all the
  setters:

  ```javascript
  function App() {
    const [checkbox, text] = useRefs();
    const [isDone, setIsDone] = combineHooks(
      useCheckbox(checkbox),
      useStyleBoolean(text, 'text-decoration', 'line-through', null),
    );

    return (
      <>
        <input type="checkbox" ref={checkbox} />
        <span ref={text}>Water the plants</span>
      </>
    );
  }
  ```

## Context

- `createContext`: This creates a new context object. Receives a default value

- `.Provider`: A component that receives a value and attaches it to the DOM
  so that it can be found by `useContext`

- `useContext`: Receives a DOM element and a context object and scans "upwards"
  in the DOM to find a parent element that uses this context object to provide
  a value. Accepts a third 'options' property that has a `direction` key that
  accepts 3 values:

  - `up`: The default value, searches upwards to find a DOM element for the context

  - `down`: Searches "below" in the DOM tree to find all elements that have a
    context specified by the context object; returns a list of contexts

  - `side`, combined with `upContext`: Combines the two searches; first it
    search upward until it finds a parent element that uses the `upContext`
    then, using that element as a starting point, searches downwards to find
    all contexts that match the context argument

# The sandbox

This is a sandbox for `domstatejsx`.

In order to get it up and running, you have to do:

```sh
git clone https://github.com/kbairak/domstatejsx
cd domstatejsx
npm install
npm run dev
```

There are a number of applications under `./src/`. In order to choose which one
you want to run, change the first line in `./src/main.jsx`. for example:

```diff
-import App from './todos';
+import App from './accordion';
```

[Here](https://www.kbairak.net/programming/react/2024/02/04/domstatejsx.html)
is a blog post where I explain how this works.

# TODOs

## General

- [ ] Documentation
- [x] Build options to extract the library to `dist`
- [x] Upload to NPM
- [ ] Add types
- [x] Create vite plugin for easy use
- [ ] Look into possible memory leaks
- [x] Instructions on how to write tests

## Specific features

General:

- [ ] Find ways to keep the refs definition and jsx closer for easier reading

Forms:

- [x] Forms should be able to work with `<select>` elements
- [x] Forms should be able to work with custom input components

Routing:

- [ ] Routing with `<Outlet/>`s
- [ ] Data router
- [x] Make `<Link>`s aware of whether they are selected
- [x] There is a bug somewhere with path matching (I don't remember what exactly)

Context:

- [x] Test with different contents of `<Provider>`s
- [x] See if we can avoid extra `<div>`s with fragments
