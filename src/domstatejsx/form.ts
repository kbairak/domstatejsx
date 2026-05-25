import type { RefObject } from './jsx-types';

type FormData = Record<string, any>;
type FormErrors = Record<string, string>;

type UseFormOptions = {
  when?: string;
  onStart?: (data: FormData) => Promise<void>;
  onSubmit?: (data: FormData) => Promise<any>;
  onSuccess?: (data: FormData, result: any) => Promise<void>;
  onError?: (errors: FormErrors) => Promise<void>;
  onEnd?: (data: FormData, errors: FormErrors) => Promise<void>;
  fields?: Record<string, FieldOptions>;
  validate?: (data: FormData) => Promise<void>;
  defaultValues?: FormData | null;
};

type FieldOptions = {
  required?: boolean;
  validate?: (value: any) => Promise<void>;
};

type FieldContext = {
  get?: () => any;
  set?: (value: any) => void;
};

type FieldRef = RefObject & {
  context?: FieldContext;
  current: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
};

type ErrorRef = RefObject & {
  current: HTMLElement;
};

export function useForm({
  when = 'onChange',
  onStart = async () => {},
  onSubmit = async () => {},
  onSuccess = async () => {},
  onError = async () => {},
  onEnd = async () => {},
  fields = {},
  validate = async () => {},
  defaultValues = null,
}: UseFormOptions = {}) {
  const fieldRefs: Record<string, FieldRef> = {};
  const fieldErrorRefs: Record<string, ErrorRef> = {};
  const formErrorRefs: ErrorRef[] = [];
  const fieldData: Record<string, FieldOptions> = { ...fields };

  let _formValidate = validate;

  function _getFieldValue(name: string): any {
    const context = fieldRefs[name].context || {};
    if ('get' in context && 'set' in context) {
      return context.get!();
    } else {
      return fieldRefs[name].current.value;
    }
  }

  function _setFieldData(name: string, value: any): void {
    const context = fieldRefs[name].context || {};
    if ('get' in context && 'set' in context) {
      context.set!(value);
    } else {
      fieldRefs[name].current.value = value;
    }
  }

  function getData(): FormData {
    return Object.fromEntries(
      Object.keys(fieldRefs).map((name) => {
        return [name, _getFieldValue(name)];
      }),
    );
  }

  function getErrors(): FormErrors {
    const result: FormErrors = Object.fromEntries(
      Object.entries(fieldErrorRefs)
        .map(([name, ref]) => [name, ref.current.innerText])
        .filter(([_, text]) => !!text),
    );
    const formErrorRef = formErrorRefs.find((ref) => !!ref.current.innerText);
    if (formErrorRef) result.__all__ = formErrorRef.current.innerText;

    return result;
  }

  async function _validateField(name: string): Promise<boolean> {
    const value = _getFieldValue(name);
    try {
      if (fieldData[name].required && !value) {
        throw new Error('This field is required');
      }
      await fieldData[name].validate?.(value);
      if (name in fieldErrorRefs) {
        fieldErrorRefs[name].current.innerText = '';
        fieldErrorRefs[name].current.style.setProperty('display', 'none');
      }
      return true;
    } catch (e) {
      if (name in fieldErrorRefs) {
        fieldErrorRefs[name].current.innerText = (e as Error).message;
        fieldErrorRefs[name].current.style.removeProperty('display');
      }
      return false;
    }
  }

  async function _validate(): Promise<boolean> {
    let validated = !(
      await Promise.all(Object.keys(fieldRefs).map(_validateField))
    ).filter((r) => !r).length;

    try {
      await _formValidate(getData());
      formErrorRefs.forEach((ref) => {
        ref.current.innerText = '';
        ref.current.style.setProperty('display', 'none');
      });
    } catch (e) {
      formErrorRefs.forEach((ref) => {
        ref.current.innerText = (e as Error).message;
        ref.current.style.removeProperty('display');
      });
      validated = false;
    }
    return validated;
  }

  function registerForm({ validate: formValidate = null }: { validate?: ((data: FormData) => Promise<void>) | null } = {}) {
    if (formValidate !== null) _formValidate = formValidate;

    setTimeout(() => {
      if (defaultValues === null) {
        defaultValues = getData();
      }
      reset();
    }, 0);

    return {
      onSubmit: async (event: Event) => {
        event.preventDefault();
        await onStart(getData());
        if (await _validate()) {
          try {
            const data = getData();
            const result = await onSubmit(data);
            formErrorRefs.forEach((ref) => {
              ref.current.innerText = '';
              ref.current.style.setProperty('display', 'none');
            });
            await onSuccess(data, result);
          } catch (e) {
            formErrorRefs.forEach((ref) => {
              ref.current.innerText = (e as Error).message;
              ref.current.style.removeProperty('display');
            });
            await onError(getErrors());
          }
        } else {
          await onError(getErrors());
        }
        await onEnd(getData(), getErrors());
      },
    };
  }

  function register(
    name: string,
    { required = null, validate: fieldValidate = null }: { required?: boolean | null; validate?: ((value: any) => Promise<void>) | null } = {},
  ) {
    fieldData[name] ??= {};
    if (required !== null) fieldData[name].required = required;
    if (fieldValidate !== null) fieldData[name].validate = fieldValidate;
    if (!('required' in fieldData[name])) fieldData[name].required = false;
    if (!('validate' in fieldData[name]))
      fieldData[name].validate = async () => {};

    return {
      ref: (r: FieldRef) => {
        fieldRefs[name] = r;
      },
      [when]: async () => _validateField(name),
    };
  }

  function registerError(name: string | null = null) {
    return {
      ref: (r: ErrorRef) => {
        if (name !== null) {
          fieldErrorRefs[name] = r;
        } else {
          formErrorRefs.push(r);
        }
      },
    };
  }

  function reset(): void {
    Object.keys(fieldRefs).forEach((name) => {
      _setFieldData(name, defaultValues![name]);
    });
  }

  return { registerForm, register, registerError, reset, getData, getErrors };
}
