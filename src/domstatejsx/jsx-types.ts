// Type definitions for domstatejsx JSX

export type JSXElement = Node;

export type ComponentChild =
  | JSXElement
  | string
  | number
  | boolean
  | null
  | undefined;

export type ComponentChildren = ComponentChild | readonly ComponentChild[];

export interface ComponentProps {
  children?: ComponentChildren;
}

export type FunctionComponent<P = {}> = (props: P & ComponentProps) => JSXElement;

export interface RefObject<T = any> {
  current?: T;
  context?: any;
}

export type RefCallback<T = any> = (ref: RefObject<T>) => void;
export type Ref<T = any> = RefObject<T> | RefCallback<T>;

// HTML Attributes (simplified - can be expanded)
export interface HTMLAttributes {
  // Standard attributes
  id?: string;
  className?: string;
  class?: string;
  style?: string | Partial<CSSStyleDeclaration>;

  // Data attributes
  [key: `data-${string}`]: string | undefined;

  // Event handlers
  onClick?: (event: MouseEvent) => void;
  onChange?: (event: Event) => void;
  onSubmit?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onKeyPress?: (event: KeyboardEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onMouseOver?: (event: MouseEvent) => void;
  onMouseOut?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;

  // Ref
  ref?: Ref;
  key?: string | number;

  // Children
  children?: ComponentChildren;
}

export interface InputHTMLAttributes extends HTMLAttributes {
  type?: string;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  autoFocus?: boolean;
}

export interface ButtonHTMLAttributes extends HTMLAttributes {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export interface FormHTMLAttributes extends HTMLAttributes {
  action?: string;
  method?: string;
}

export interface AnchorHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: string;
  rel?: string;
}

export interface ImgHTMLAttributes extends HTMLAttributes {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

// SVG Attributes (basic)
export interface SVGAttributes extends HTMLAttributes {
  viewBox?: string;
  xmlns?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
}

// JSX Namespace
declare global {
  namespace JSX {
    interface Element extends Node {}

    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicElements {
      // HTML Elements
      div: HTMLAttributes;
      span: HTMLAttributes;
      p: HTMLAttributes;
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      a: AnchorHTMLAttributes;
      button: ButtonHTMLAttributes;
      input: InputHTMLAttributes;
      textarea: HTMLAttributes;
      select: HTMLAttributes;
      option: HTMLAttributes;
      form: FormHTMLAttributes;
      label: HTMLAttributes;
      img: ImgHTMLAttributes;
      ul: HTMLAttributes;
      ol: HTMLAttributes;
      li: HTMLAttributes;
      table: HTMLAttributes;
      thead: HTMLAttributes;
      tbody: HTMLAttributes;
      tr: HTMLAttributes;
      td: HTMLAttributes;
      th: HTMLAttributes;
      br: HTMLAttributes;
      hr: HTMLAttributes;
      pre: HTMLAttributes;
      code: HTMLAttributes;

      // SVG Elements
      svg: SVGAttributes;
      circle: SVGAttributes;
      path: SVGAttributes;
      rect: SVGAttributes;
      line: SVGAttributes;
      polyline: SVGAttributes;
      polygon: SVGAttributes;
      ellipse: SVGAttributes;
      g: SVGAttributes;
      text: SVGAttributes;
      defs: SVGAttributes;
      use: SVGAttributes;
      clipPath: SVGAttributes;
      mask: SVGAttributes;
      pattern: SVGAttributes;
      linearGradient: SVGAttributes;
      radialGradient: SVGAttributes;
      stop: SVGAttributes;
      animate: SVGAttributes;
      animateTransform: SVGAttributes;
      animateMotion: SVGAttributes;

      // Allow any other HTML element
      [elemName: string]: any;
    }
  }
}
