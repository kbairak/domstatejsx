import {
  jsx as jsxDomJsx,
  createElement as jsxDomCreateElement,
} from 'jsx-dom';

// jsx.js
export function jsx(
  ...args: Parameters<typeof jsxDomJsx>
): ReturnType<typeof jsxDomJsx>;

export function createElement(
  ...args: Parameters<typeof jsxDomCreateElement>
): ReturnType<typeof jsxDomCreateElement>;

export function jsxs(
  ...args: Parameters<typeof jsxDomJsx>
): ReturnType<typeof jsxDomJsx>;

export function jsxDev(
  ...args: Parameters<typeof jsxDomJsx>
): ReturnType<typeof jsxDomJsx>;

// hooks.jsx
type Ref = { current?: HTMLElement | null; context?: any };

declare function useRefs(): Ref;

declare function combineHooks(
  ...hooks: [() => any, (value: any) => void][]
): [() => any, (value: any) => void];

declare function useTextContent(
  ref: Ref,
): [() => string, (value: string) => void];

declare function useIntContent(
  ref: Ref,
): [() => number, (value: number) => void];

declare function useStyleBoolean(
  ref: Ref,
  property: string,
  onValue: string | null,
  offValue: string | null,
): [() => boolean, (value: boolean) => void];

declare function useCheckbox(
  ref: Ref,
): [() => boolean, (value: boolean) => void];

declare function useTextInput(
  ref: Ref,
): [() => string, (value: string) => void];

declare function usePropertyBoolean(
  ref: Ref,
  property: string,
  onValue: any,
  offValue: any,
): [() => boolean, (value: boolean) => void];

declare function useErrorMessage(
  ref: Ref,
): [() => string | null, (value: string | null) => void];

declare function useClassBoolean(
  ref: Ref,
  onValue: string | null,
  offValue: string | null,
): [() => boolean, (value: boolean) => void];

declare function useList(
  ref: Ref,
  Component: (props: any[]) => HTMLElement,
): [() => Ref[], (...props: any[]) => void, (...props: any[]) => void];

declare function useControlledInput(
  ref: Ref,
): [() => any, (value: any) => void];

// context.jsx
import { Context } from './context';

declare function createContext(defaultValue: any): Context;

declare function useContext(node: HTMLElement, context: Context): any;

// query.js
export function useQuery(options: {
  onStart?: () => void;
  queryFn: (...args: any) => Promise<any>;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
  defaultArgs?: any[];
  enabled?: boolean;
}): { refetch: (...args: any) => void };

export function useMutation(options: {
  onStart?: () => void;
  mutationFn: (...args: any) => Promise<any>;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}): { mutate: (...args: any) => void };

// form.js
declare function useForm(options?: {
  when?: string;
  onStart?: () => void;
  onSubmit?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  onEnd?: () => void;
  fields?: Record<
    string,
    { required?: boolean; validate: (value: any) => Promise<void> }
  >;
  validate?: (data: object) => Promise<void>;
  defaultValues?: object;
}): {
  registerForm: (options?: { validate: (data: object) => Promise<void> }) => {
    onSubmit: (event: SubmitEvent) => void;
  };
  register: (
    name: string,
    options?: { required?: boolean; validate?: (value: any) => Promise<void> },
  ) => object;
  registerError: (name?: string) => { ref: (r: Ref) => void };
  reset: () => void;
  getData: () => object;
  getErrors: () => object;
};

// router.jsx
declare function Route(options: {
  path: string;
  end?: boolean;
  NotFound?: () => HTMLElement;
  render: (props?: object) => HTMLElement;
}): HTMLElement;

declare function Link(options: {
  to: string;
  render?: (props?: {
    onClick?: (event: Event) => void;
    isActive: boolean;
  }) => HTMLElement;
  children?: HTMLElement | HTMLElement[];
}): HTMLElement;
