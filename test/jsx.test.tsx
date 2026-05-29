/** @jsxImportSource /src/domstatejsx */
import { describe, it, expect, vi } from 'vitest';
import { createElement } from '../src/domstatejsx/jsx';

describe('JSX Element Creation', () => {
  describe('Basic elements', () => {
    it('creates a simple div element', () => {
      const element = (<div />) as HTMLElement;
      expect(element.nodeName).toBe('DIV');
      expect(element.nodeType).toBe(Node.ELEMENT_NODE);
    });

    it('creates a span element', () => {
      const element = (<span />) as HTMLElement;
      expect(element.nodeName).toBe('SPAN');
    });

    it('creates a button element', () => {
      const element = (<button />) as HTMLElement;
      expect(element.nodeName).toBe('BUTTON');
    });

    it('creates an input element', () => {
      const element = (<input />) as HTMLElement;
      expect(element.nodeName).toBe('INPUT');
    });
  });

  describe('Text content', () => {
    it('creates element with text content as child', () => {
      const element = (<p>hello</p>) as HTMLElement;
      expect(element.textContent).toBe('hello');
    });

    it('creates element with number as child', () => {
      const element = (<p>{42}</p>) as HTMLElement;
      expect(element.textContent).toBe('42');
    });

    it('creates element with zero as child', () => {
      const element = (<p>{0}</p>) as HTMLElement;
      expect(element.textContent).toBe('0');
    });

    it('creates element with multiple text children', () => {
      const element = (
        <p>
          {'hello'} {'world'}
        </p>
      ) as HTMLElement;
      expect(element.textContent).toBe('hello world');
    });
  });

  describe('Attributes', () => {
    it('sets id attribute', () => {
      const element = (<div id="test" />) as HTMLElement;
      expect(element.id).toBe('test');
    });

    it('sets class attribute', () => {
      const element = (<div class="foo" />) as HTMLElement;
      expect(element.className).toBe('foo');
    });

    it('sets className attribute', () => {
      const element = (<div className="bar" />) as HTMLElement;
      expect(element.className).toBe('bar');
    });

    it('sets data attributes', () => {
      const element = (<div data-testid="foo" />) as HTMLElement;
      expect(element.getAttribute('data-testid')).toBe('foo');
    });

    it('sets type attribute on input', () => {
      const element = (<input type="text" />) as HTMLInputElement;
      expect(element.type).toBe('text');
    });

    it('sets value attribute on input', () => {
      const element = (<input value="hello" />) as HTMLInputElement;
      expect(element.value).toBe('hello');
    });

    it('sets placeholder attribute', () => {
      const element = (<input placeholder="Enter text" />) as HTMLInputElement;
      expect(element.placeholder).toBe('Enter text');
    });

    it('sets href attribute on link', () => {
      const element = (<a href="https://example.com" />) as HTMLAnchorElement;
      expect(element.href).toBe('https://example.com/');
    });

    it('sets multiple attributes', () => {
      const element = (
        <div id="test" className="foo bar" data-value="123" />
      ) as HTMLElement;
      expect(element.id).toBe('test');
      expect(element.className).toBe('foo bar');
      expect(element.getAttribute('data-value')).toBe('123');
    });
  });

  describe('Boolean attributes', () => {
    it('sets disabled attribute to true', () => {
      const element = (<button disabled={true} />) as HTMLButtonElement;
      expect(element.disabled).toBe(true);
    });

    it('sets disabled attribute to false', () => {
      const element = (<button disabled={false} />) as HTMLButtonElement;
      expect(element.disabled).toBe(false);
    });

    it('sets checked attribute to true', () => {
      const element = (
        <input type="checkbox" checked={true} />
      ) as HTMLInputElement;
      expect(element.checked).toBe(true);
    });

    it('sets checked attribute to false', () => {
      const element = (
        <input type="checkbox" checked={false} />
      ) as HTMLInputElement;
      expect(element.checked).toBe(false);
    });
  });

  describe('Event handlers', () => {
    it('attaches onClick handler', () => {
      const handler = vi.fn();
      const element = (<button onClick={handler} />) as HTMLButtonElement;
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches onChange handler', () => {
      const handler = vi.fn();
      const element = (<input onChange={handler} />) as HTMLInputElement;
      element.dispatchEvent(new Event('change'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches onSubmit handler', () => {
      const handler = vi.fn((e: Event) => e.preventDefault());
      const element = (<form onSubmit={handler} />) as HTMLFormElement;
      element.dispatchEvent(new Event('submit'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches onMouseOver handler', () => {
      const handler = vi.fn();
      const element = (<div onMouseOver={handler} />) as HTMLElement;
      element.dispatchEvent(new Event('mouseover'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches onKeyDown handler', () => {
      const handler = vi.fn();
      const element = (<input onKeyDown={handler} />) as HTMLInputElement;
      element.dispatchEvent(new Event('keydown'));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Style handling', () => {
    it('sets style from string', () => {
      const element = (<div style="color: red" />) as HTMLElement;
      expect(element.style.color).toBe('red');
    });

    it('sets style from object', () => {
      const element = (
        <div style={{ color: 'red', backgroundColor: 'blue' }} />
      ) as HTMLElement;
      expect(element.style.color).toBe('red');
      expect(element.style.backgroundColor).toBe('blue');
    });

    it('sets complex style object', () => {
      const element = (
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '10px',
          }}
        />
      ) as HTMLElement;
      expect(element.style.fontSize).toBe('16px');
      expect(element.style.fontWeight).toBe('bold');
      expect(element.style.margin).toBe('10px');
    });
  });

  describe('Children handling', () => {
    it('creates element with single child element', () => {
      const child = <span>child</span>;
      const parent = (<div>{child}</div>) as HTMLElement;
      expect(parent.children.length).toBe(1);
      expect(parent.children[0].nodeName).toBe('SPAN');
      expect(parent.textContent).toBe('child');
    });

    it('creates nested elements', () => {
      const element = (
        <div>
          <span>nested</span>
        </div>
      ) as HTMLElement;
      expect(element.querySelector('span')!.textContent).toBe('nested');
    });

    it('creates element with array of children', () => {
      const children = [
        <span key="1">one</span>,
        <span key="2">two</span>,
        <span key="3">three</span>,
      ];
      const element = (<div>{children}</div>) as HTMLElement;
      expect(element.children.length).toBe(3);
      expect(element.textContent).toBe('onetwothree');
    });

    it('creates element with mixed text and element children', () => {
      const element = (
        <div>
          {'text'}
          <span>span</span>
          {'more'}
        </div>
      ) as HTMLElement;
      expect(element.childNodes.length).toBe(3);
      expect(element.textContent).toBe('textspanmore');
    });

    it('handles null children', () => {
      const element = (
        <div>
          {'text'}
          {null}
          {'more'}
        </div>
      ) as HTMLElement;
      expect(element.textContent).toBe('textmore');
    });

    it('handles undefined children', () => {
      const element = (
        <div>
          {'text'}
          {undefined}
          {'more'}
        </div>
      ) as HTMLElement;
      expect(element.textContent).toBe('textmore');
    });

    it('handles false children', () => {
      const element = (
        <div>
          {'text'}
          {false}
          {'more'}
        </div>
      ) as HTMLElement;
      expect(element.textContent).toBe('textmore');
    });

    it('handles true children', () => {
      const element = (
        <div>
          {'text'}
          {true}
          {'more'}
        </div>
      ) as HTMLElement;
      expect(element.textContent).toBe('textmore');
    });

    it('handles conditional children with &&', () => {
      const element1 = (<div>{true && <span>shown</span>}</div>) as HTMLElement;
      expect(element1.querySelector('span')).not.toBeNull();

      const element2 = (
        <div>{false && <span>hidden</span>}</div>
      ) as HTMLElement;
      expect(element2.querySelector('span')).toBeNull();
    });

    it('handles nested arrays of children', () => {
      const element = (
        <div>{[<span key="1">one</span>, <span key="2">two</span>]}</div>
      ) as HTMLElement;
      expect(element.children.length).toBe(2);
    });
  });

  describe('Fragments', () => {
    it('creates a fragment', () => {
      const fragment = (<></>) as DocumentFragment;
      expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    });

    it('creates fragment with children', () => {
      const fragment = (
        <>
          <div>one</div>
          <span>two</span>
        </>
      ) as DocumentFragment;
      expect(fragment.childNodes.length).toBe(2);
    });

    it('can append fragment to element', () => {
      const fragment = (
        <>
          <div>one</div>
          <span>two</span>
        </>
      ) as DocumentFragment;
      const container = (<div />) as HTMLElement;
      container.appendChild(fragment);
      expect(container.children.length).toBe(2);
      expect(container.children[0].textContent).toBe('one');
      expect(container.children[1].textContent).toBe('two');
    });

    it('handles nested fragments', () => {
      const inner = (
        <>
          <span>inner</span>
        </>
      ) as DocumentFragment;
      const outer = (
        <>
          <div>outer</div>
          {inner}
        </>
      ) as DocumentFragment;
      const container = (<div />) as HTMLElement;
      container.appendChild(outer);
      expect(container.children.length).toBe(2);
    });
  });

  describe('Component functions', () => {
    it('renders a simple component', () => {
      function Comp() {
        return <div>component</div>;
      }
      const element = (<Comp />) as HTMLElement;
      expect(element.nodeName).toBe('DIV');
      expect(element.textContent).toBe('component');
    });

    it('renders component with props', () => {
      function Comp({ text }: { text: string }) {
        return <div>{text}</div>;
      }
      const element = (<Comp text="hello" />) as HTMLElement;
      expect(element.textContent).toBe('hello');
    });

    it('renders component with children via props', () => {
      function Comp({ children }: { children: any }) {
        return <div>{children}</div>;
      }
      const element = (
        <Comp>
          <span>child</span>
        </Comp>
      ) as HTMLElement;
      expect(element.querySelector('span')!.textContent).toBe('child');
    });

    it('renders component with multiple props', () => {
      function Comp({
        id,
        className,
        text,
      }: {
        id: string;
        className: string;
        text: string;
      }) {
        return (
          <div id={id} className={className}>
            {text}
          </div>
        );
      }
      const element = (
        <Comp id="test" className="foo" text="bar" />
      ) as HTMLElement;
      expect(element.id).toBe('test');
      expect(element.className).toBe('foo');
      expect(element.textContent).toBe('bar');
    });

    it('renders nested components', () => {
      function Inner({ text }: { text: string }) {
        return <span>{text}</span>;
      }
      function Outer() {
        return (
          <div>
            <Inner text="nested" />
          </div>
        );
      }
      const element = (<Outer />) as HTMLElement;
      expect(element.querySelector('span')!.textContent).toBe('nested');
    });
  });

  describe('Spread props', () => {
    it('handles spread props', () => {
      const props = { id: 'test', className: 'foo', 'data-value': '123' };
      const element = (<div {...props} />) as HTMLElement;
      expect(element.id).toBe('test');
      expect(element.className).toBe('foo');
      expect(element.getAttribute('data-value')).toBe('123');
    });

    it('handles spread props with override', () => {
      const props = { id: 'test', className: 'foo' };
      const element = (<div {...props} className="bar" />) as HTMLElement;
      expect(element.id).toBe('test');
      expect(element.className).toBe('bar');
    });
  });

  describe('Edge cases', () => {
    it('creates empty div', () => {
      const element = (<div />) as HTMLElement;
      expect(element.childNodes.length).toBe(0);
    });

    it('handles self-closing tags', () => {
      const input = (<input />) as HTMLInputElement;
      expect(input.nodeName).toBe('INPUT');

      const br = <br />;
      expect(br.nodeName).toBe('BR');

      const img = <img />;
      expect(img.nodeName).toBe('IMG');
    });

    it('handles SVG elements', () => {
      const svg = <svg />;
      expect(svg.nodeName).toBe('svg');

      const circle = <circle />;
      expect(circle.nodeName).toBe('circle');
    });

    it('handles empty string children', () => {
      const element = <div>{''}</div>;
      expect(element.textContent).toBe('');
    });

    it('handles children in props', () => {
      const element = <div>props</div>;
      expect(element.textContent).toBe('props');
    });
  });

  describe('createElement compatibility', () => {
    it('createElement with children as varargs', () => {
      // createElement (classic transform) accepts children as varargs
      const element = createElement(
        'div',
        { id: 'test' },
        'text',
      ) as HTMLElement;
      expect(element.nodeName).toBe('DIV');
      expect(element.id).toBe('test');
      expect(element.textContent).toBe('text');
    });

    it('createElement with multiple children', () => {
      const element = createElement(
        'div',
        {},
        'text',
        createElement('span', {}, 'span'),
        'more',
      ) as HTMLElement;
      expect(element.childNodes.length).toBe(3);
      expect(element.textContent).toBe('textspanmore');
    });
  });
});
