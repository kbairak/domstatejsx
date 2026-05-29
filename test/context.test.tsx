/** @jsxImportSource /src/domstatejsx */
import { describe, it, expect } from 'vitest';
import { createContext, useContext, findUp } from '../src/domstatejsx/context';
import { useRefs } from '../src/domstatejsx/hooks';

describe('context', () => {
  it('provides and consumes context', () => {
    const [childRef] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ msg: 'hello' }}>
      <div>
        <div ref={childRef} />
      </div>
    </Context.Provider>;
    expect(useContext(childRef.current, Context).msg).toBe('hello');
  });

  it('uses default value when no provider exists', () => {
    const [childRef] = useRefs();
    const Context = createContext({ msg: 'default' });
    <div ref={childRef} />;
    expect(useContext(childRef.current, Context)).toBeUndefined();
  });

  it('returns default value from provider when value is not provided', () => {
    const [childRef] = useRefs();
    const Context = createContext({ msg: 'default' });
    <Context.Provider value={undefined}>
      <div>
        <div ref={childRef} />
      </div>
    </Context.Provider>;
    const result = useContext(childRef.current, Context) as any;
    expect(result.msg).toBe('default');
  });

  it('handles nested providers', () => {
    const [outerRef, innerRef] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ level: 'outer' }}>
      <div>
        <div ref={outerRef}>
          <Context.Provider value={{ level: 'inner' }}>
            <div>
              <div ref={innerRef} />
            </div>
          </Context.Provider>
        </div>
      </div>
    </Context.Provider>;
    expect(useContext(outerRef.current, Context).level).toBe('outer');
    expect(useContext(innerRef.current, Context).level).toBe('inner');
  });

  it('handles multiple different contexts', () => {
    const [childRef] = useRefs();
    const UserContext = createContext();
    const ThemeContext = createContext();
    <UserContext.Provider value={{ name: 'Alice' }}>
      <div>
        <ThemeContext.Provider value={{ theme: 'dark' }}>
          <div>
            <div ref={childRef} />
          </div>
        </ThemeContext.Provider>
      </div>
    </UserContext.Provider>;
    expect(useContext(childRef.current, UserContext).name).toBe('Alice');
    expect(useContext(childRef.current, ThemeContext).theme).toBe('dark');
  });

  it('finds context from deeply nested elements', () => {
    const [deepRef] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ msg: 'found' }}>
      <div>
        <div>
          <div>
            <div>
              <div ref={deepRef} />
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>;
    expect(useContext(deepRef.current, Context).msg).toBe('found');
  });

  it('returns undefined when context not found', () => {
    const [childRef] = useRefs();
    const Context = createContext();
    <div ref={childRef} />;
    expect(useContext(childRef.current, Context)).toBeUndefined();
  });

  describe('findUp', () => {
    it('finds parent provider element', () => {
      const [providerRef, childRef] = useRefs();
      const Context = createContext();
      <Context.Provider value={{ msg: 'test' }}>
        <div ref={providerRef}>
          <div>
            <div ref={childRef} />
          </div>
        </div>
      </Context.Provider>;
      const parent = findUp(childRef.current, Context);
      expect(parent).toBe(providerRef.current);
    });

    it('returns undefined when no provider found', () => {
      const [childRef] = useRefs();
      const Context = createContext();
      <div ref={childRef} />;
      expect(findUp(childRef.current, Context)).toBeUndefined();
    });
  });

  describe('direction: down', () => {
    it('finds all child providers', () => {
      const [containerRef, child1Ref, child2Ref] = useRefs();
      const Context = createContext();
      <div ref={containerRef}>
        <Context.Provider value={{ id: 1 }}>
          <div ref={child1Ref} />
        </Context.Provider>
        <Context.Provider value={{ id: 2 }}>
          <div ref={child2Ref} />
        </Context.Provider>
      </div>;
      const values = useContext(containerRef.current, Context, {
        direction: 'down',
      }) as any[];
      expect(values).toHaveLength(2);
      expect(values[0].id).toBe(1);
      expect(values[1].id).toBe(2);
    });

    it('returns empty array when no child providers found', () => {
      const [containerRef] = useRefs();
      const Context = createContext();
      <div ref={containerRef}>
        <div />
      </div>;
      const values = useContext(containerRef.current, Context, {
        direction: 'down',
      }) as any[];
      expect(values).toHaveLength(0);
    });
  });

  describe('direction: side', () => {
    it('finds sibling contexts via upContext', () => {
      const [sourceRef] = useRefs();
      const TargetContext = createContext();
      const UpContext = createContext();
      <UpContext.Provider value={{}}>
        <div>
          <div ref={sourceRef} />
          <TargetContext.Provider value={{ msg: 'sibling' }}>
            <div />
          </TargetContext.Provider>
        </div>
      </UpContext.Provider>;
      const values = useContext(sourceRef.current, TargetContext, {
        direction: 'side',
        upContext: UpContext,
      }) as any[];
      expect(values).toHaveLength(1);
      expect(values[0].msg).toBe('sibling');
    });
  });

  it('handles provider with array of children', () => {
    const [child1Ref, child2Ref] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ msg: 'array' }}>
      {[<div key="1" ref={child1Ref} />, <div key="2" ref={child2Ref} />]}
    </Context.Provider>;
    expect(useContext(child1Ref.current, Context).msg).toBe('array');
    expect(useContext(child2Ref.current, Context).msg).toBe('array');
  });

  it('handles provider with fragment children', () => {
    const [childRef] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ msg: 'fragment' }}>
      <>
        <div ref={childRef} />
      </>
    </Context.Provider>;
    expect(useContext(childRef.current, Context).msg).toBe('fragment');
  });

  it('handles provider with no children', () => {
    const Context = createContext();
    const provider = <Context.Provider value={{ msg: 'no children' }} />;
    expect(provider.nodeName).toBe('SPAN');
  });

  it('handles provider with text children', () => {
    const [childRef] = useRefs();
    const Context = createContext();
    <Context.Provider value={{ msg: 'text' }}>
      <div>
        <div ref={childRef}>Some text</div>
      </div>
    </Context.Provider>;
    expect(useContext(childRef.current, Context).msg).toBe('text');
  });
});
