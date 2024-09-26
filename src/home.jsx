import { useRefProxy, useIntContent } from './lib/domstatejsx';
import logo from '../public/dominojs.webp';

function trim(str) {
  // split lines
  const lines = str.split('\n');

  // remove top lines if they are empty or filled with only spaces
  for (;;) {
    if (lines[0].trim() === '') {
      lines.shift();
    } else {
      break;
    }
  }

  // remove bottom lines if they are empty or filled with only spaces
  for (;;) {
    if (lines.at(-1).trim() === '') {
      lines.pop();
    } else {
      break;
    }
  }

  // find smallest indentation
  const indent = lines.reduce((acc, line) => {
    if (line.trim() === '') return acc;
    const lineIndent = line.match(/^\s*/)[0].length;
    return Math.min(acc, lineIndent);
  }, Infinity);

  // Remove indentaion from all lines
  return lines.map((line) => line.slice(indent)).join('\n');
}

export default function App() {
  return (
    <div class="bg-slate-300 h-full w-screen">
      <div class="container mx-auto flex flex-col gap-y-4">
        <h1 class="text-4xl text-center pt-8">Welcome to DominoJS</h1>

        <div class="flex flex-col lg:flex-row gap-y-4 lg:gap-x-4">
          <div class="flex-1 flex flex-col gap-y-4">
            <p class="text-xl">
              DominoJS is a lightweight JavaScript library that empowers
              developers to build dynamic, efficient web applications with a
              focus on direct DOM manipulation.
            </p>

            <p class="text-xl">Key Features:</p>

            <ul class="list-disc flex flex-col gap-y-4 mb-4">
              <li>
                Direct DOM Manipulation: DominoJS embraces the native browser
                APIs. You create and modify DOM elements directly using JSX as a
                wrapper for document.createElement, simplifying the process of
                building UIs.
              </li>

              <li>
                DOM as the Single Source of Truth: In DominoJS, the state lives
                entirely within the DOM. No need to store state in variables or
                complex structures—just manipulate the DOM, and you're done!
              </li>

              <li>
                Component-Driven Development: Components in DominoJS are
                functions that return DOM elements. These components can handle
                events through closures and manage state through the DOM itself.
              </li>

              <li>
                Familiar Patterns, Less Overhead: While DominoJS introduces new
                paradigms, it keeps familiar concepts like context providers,
                useContext, and refs, ensuring an easy learning curve for
                developers experienced with React.
              </li>

              <li>
                Hooks for Direct DOM Access: Just like React, DominoJS provides
                hooks for working with the DOM and interacting with its
                elements—streamlining your development workflow without
                overcomplicating the logic.
              </li>
            </ul>
          </div>
          <div class="flex-1">
            <img src={logo} />
          </div>
        </div>

        <h1 class="text-xl">Lets see it in action</h1>

        <p>JSX returns native DOM elements</p>

        <div class="flex gap-x-4">
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">
              <pre>
                <code>
                  {trim(`
                    function App() {
                      return 'Hello world';
                    }
                    document.body.append(<App />);
                  `)}
                </code>
              </pre>
            </div>
          </div>
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">Hello world</div>
          </div>
        </div>

        <p>We can create interactive components. Let's start with</p>

        <div class="flex gap-x-4">
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">
              <pre>
                <code>
                  {trim(`
                    function App() {
                      return (
                        <>
                          <div>
                            <button>Click Me</button>
                          </div>
                          <div>
                            Count: <span>0</span>
                          </div>
                        </>
                      );
                    }
                `)}
                </code>
              </pre>
            </div>
          </div>
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">
              <div>
                <button class="border rounded p-1">Click Me</button>
              </div>
              <div>
                Count: <span>0</span>
              </div>
            </div>
          </div>
        </div>

        <p>and add interactions</p>

        <div class="flex gap-x-4">
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">
              <pre>
                <code>
                  {trim(`
                    +import { useRefProxy, useIntContent } from 'domstatejsx';

                     function App() {

                    +  const refs = useRefProxy();
                    +  const [, setCount] = useIntContent(refs.span)

                       return (
                         <>
                           <div>
                    -        <button>Click Me</button>
                    +        <button onClick={() => setCount((p) => p + 1)}>
                    +          Click Me
                    +        </button>
                           </div>
                           <div>
                    -        Count: <span>0</span>
                    +        Count: <span ref={refs.span}>0</span>
                           </div>
                         </>
                       );
                     }
                `)}
                </code>
              </pre>
            </div>
          </div>
          <div class="flex-1">
            <div class="border rounded-md p-4 mt-4">
              <Counter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Counter() {
  const refs = useRefProxy();
  const [, setCount] = useIntContent(refs.span);

  return (
    <>
      <div>
        <button
          onClick={() => setCount((p) => p + 1)}
          class="border rounded p-1"
        >
          Click Me
        </button>
      </div>
      <div>
        Count: <span ref={refs.span}>0</span>
      </div>
    </>
  );
}
