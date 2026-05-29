/** @jsxImportSource /src/domstatejsx */
import { describe, it, expect } from 'vitest';
import {
  useTextContent,
  useIntContent,
  useTextInput,
  useNumberInput,
  useCheckbox,
  useStyleBoolean,
  usePropertyBoolean,
  useErrorMessage,
  useClassBoolean,
  useRefs,
  combineHooks,
} from '../src/domstatejsx/hooks';

describe('hooks', () => {
  describe('useTextContent', () => {
    it('works', () => {
      const ref = {};
      const p = <p ref={ref}>one</p>;
      const [get, set] = useTextContent(ref);
      expect(p.textContent).toBe('one');
      expect(get()).toBe('one');
      set('two');
      expect(p.textContent).toBe('two');
      expect(get()).toBe('two');
    });

    it('accepts a function updater', () => {
      const ref = {};
      <p ref={ref}>hello</p>;
      const [get, set] = useTextContent(ref);
      set((prev) => prev + ' world');
      expect(get()).toBe('hello world');
    });
  });

  describe('useIntContent', () => {
    it('works', () => {
      const ref = {};
      const p = <p ref={ref}>42</p>;
      const [get, set] = useIntContent(ref);
      expect(get()).toBe(42);
      set(100);
      expect(p.textContent).toBe('100');
      expect(get()).toBe(100);
    });

    it('accepts a function updater', () => {
      const ref = {};
      <p ref={ref}>10</p>;
      const [get, set] = useIntContent(ref);
      set((prev) => prev * 2);
      expect(get()).toBe(20);
    });
  });

  describe('useTextInput', () => {
    it('works', () => {
      const ref = {};
      const input = (<input ref={ref} value="initial" />) as HTMLInputElement;
      const [get, set] = useTextInput(ref);
      expect(get()).toBe('initial');
      set('updated');
      expect(input.value).toBe('updated');
      expect(get()).toBe('updated');
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<input ref={ref} value="hello" />) as HTMLInputElement;
      const [get, set] = useTextInput(ref);
      set((prev) => prev + '!');
      expect(get()).toBe('hello!');
    });
  });

  describe('useNumberInput', () => {
    it('works', () => {
      const ref = {};
      const input = (
        <input ref={ref} type="number" value="5" />
      ) as HTMLInputElement;
      const [get, set] = useNumberInput(ref);
      expect(get()).toBe(5);
      set(10);
      expect(input.value).toBe('10');
      expect(get()).toBe(10);
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<input ref={ref} type="number" value="3" />) as HTMLInputElement;
      const [get, set] = useNumberInput(ref);
      set((prev) => prev + 7);
      expect(get()).toBe(10);
    });
  });

  describe('useCheckbox', () => {
    it('works', () => {
      const ref = {};
      const input = (
        <input ref={ref} type="checkbox" checked={false} />
      ) as HTMLInputElement;
      const [get, set] = useCheckbox(ref);
      expect(get()).toBe(false);
      set(true);
      expect(input.checked).toBe(true);
      expect(get()).toBe(true);
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<input ref={ref} type="checkbox" checked={false} />) as HTMLInputElement;
      const [get, set] = useCheckbox(ref);
      set((prev) => !prev);
      expect(get()).toBe(true);
    });
  });

  describe('useStyleBoolean', () => {
    it('works with onValue and offValue', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      const [get, set] = useStyleBoolean(ref, 'display', 'none', 'block');
      expect(get()).toBe(false);
      set(true);
      expect(div.style.display).toBe('none');
      expect(get()).toBe(true);
      set(false);
      expect(div.style.display).toBe('block');
      expect(get()).toBe(false);
    });

    it('removes property when value is null', () => {
      const ref = {};
      const div = (
        <div ref={ref} style={{ display: 'none' }} />
      ) as HTMLElement;
      const [get, set] = useStyleBoolean(ref, 'display', 'none', null);
      expect(get()).toBe(true);
      set(false);
      expect(div.style.display).toBe('');
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<div ref={ref} />) as HTMLElement;
      const [get, set] = useStyleBoolean(ref, 'display', 'none', 'block');
      set((prev) => !prev);
      expect(get()).toBe(true);
    });
  });

  describe('usePropertyBoolean', () => {
    it('works with onValue and offValue', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      const [get, set] = usePropertyBoolean(ref, 'hidden', true, false);
      set(true);
      expect((div as any).hidden).toBe(true);
      expect(get()).toBe(true);
      set(false);
      expect((div as any).hidden).toBe(false);
      expect(get()).toBe(false);
    });

    it('deletes property when value is null', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      (div as any).customProp = 'value';
      const [get, set] = usePropertyBoolean(ref, 'customProp', 'value', null);
      expect(get()).toBe('value');
      (set as any)(false);
      expect((div as any).customProp).toBeUndefined();
    });

    it('accepts a function updater', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      const [, set] = usePropertyBoolean(ref, 'hidden', true, false);
      set(true);
      set((prev: any) => !prev);
      expect((div as any).hidden).toBe(false);
    });
  });

  describe('useErrorMessage', () => {
    it('works', () => {
      const ref = {};
      const div = (
        <div ref={ref} style={{ display: 'none' }} />
      ) as HTMLElement;
      const [get, set] = useErrorMessage(ref);
      expect(get()).toBe(null);
      set('Error message');
      expect(div.textContent).toBe('Error message');
      expect(div.style.display).toBe('');
      expect(get()).toBe('Error message');
      set(null);
      expect(div.textContent).toBe('');
      expect(div.style.display).toBe('none');
      expect(get()).toBe(null);
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<div ref={ref}>Error</div>) as HTMLElement;
      const [get, set] = useErrorMessage(ref);
      set((prev) => (prev ? prev + '!' : 'New error'));
      expect(get()).toBe('Error!');
    });
  });

  describe('useClassBoolean', () => {
    it('works with single class names', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      const [get, set] = useClassBoolean(ref, 'active', 'inactive');
      expect(get()).toBe(false);
      set(true);
      expect(div.classList.contains('active')).toBe(true);
      expect(div.classList.contains('inactive')).toBe(false);
      expect(get()).toBe(true);
      set(false);
      expect(div.classList.contains('inactive')).toBe(true);
      expect(div.classList.contains('active')).toBe(false);
    });

    it('works with multiple class names', () => {
      const ref = {};
      const div = (<div ref={ref} />) as HTMLElement;
      const [, set] = useClassBoolean(ref, ['foo', 'bar'], ['baz', 'qux']);
      set(true);
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(true);
      expect(div.classList.contains('baz')).toBe(false);
      expect(div.classList.contains('qux')).toBe(false);
      set(false);
      expect(div.classList.contains('foo')).toBe(false);
      expect(div.classList.contains('bar')).toBe(false);
      expect(div.classList.contains('baz')).toBe(true);
      expect(div.classList.contains('qux')).toBe(true);
    });

    it('works with null values', () => {
      const ref = {};
      const div = (<div ref={ref} className="active" />) as HTMLElement;
      const [get, set] = useClassBoolean(ref, 'active', null);
      expect(get()).toBe(true);
      set(false);
      expect(div.className).not.toContain('active');
    });

    it('accepts a function updater', () => {
      const ref = {};
      (<div ref={ref} />) as HTMLElement;
      const [get, set] = useClassBoolean(ref, 'active', 'inactive');
      set((prev) => !prev);
      expect(get()).toBe(true);
    });
  });

  describe('combineHooks', () => {
    it('works', () => {
      const [p1Ref, p2Ref] = useRefs();
      const p1 = <p ref={p1Ref}>one</p>;
      const p2 = <p ref={p2Ref}>one</p>;
      const [get, set] = combineHooks(
        useTextContent(p1Ref),
        useTextContent(p2Ref),
      );
      expect(p1.textContent).toBe('one');
      expect(p2.textContent).toBe('one');
      expect(get()).toBe('one');
      set('two');
      expect(p1.textContent).toBe('two');
      expect(p2.textContent).toBe('two');
      expect(get()).toBe('two');
    });
  });
});
