/*  TODOs:
 *  - selects
 *  - other components
 * */

export function useForm({
  when = 'onChange',
  onStart = async () => {},
  onSubmit = async () => {},
  onSuccess = async () => {},
  onError = async () => {},
  onEnd = async () => {},
  fields,
  validate = async () => {},
  defaultValues = null,
} = {}) {
  const fieldRefs = {};
  const fieldErrorRefs = {};
  const formErrorRefs = [];
  const fieldData = { ...fields };

  let _formValidate = validate;

  function _getFieldValue(name) {
    const context = fieldRefs[name].context || {};
    if ('get' in context && 'set' in context) {
      return context.get();
    } else {
      return fieldRefs[name].current.value;
    }
  }
  function _setFieldData(name, value) {
    const context = fieldRefs[name].context || {};
    if ('get' in context && 'set' in context) {
      context.set(value);
    } else {
      fieldRefs[name].current.value = value;
    }
  }

  function getData() {
    return Object.fromEntries(
      Object.keys(fieldRefs).map((name) => {
        return [name, _getFieldValue(name)];
      }),
    );
  }

  function getErrors() {
    const result = Object.fromEntries(
      Object.entries(fieldErrorRefs)
        .map(([name, ref]) => [name, ref.current.innerText])
        .filter(([_, text]) => !!text),
    );
    const formErrorRef = formErrorRefs.find((ref) => !!ref.current.innerText);
    if (formErrorRef) result.__all__ = formErrorRef.current.innerText;

    return result;
  }

  async function _validateField(name) {
    const value = _getFieldValue(name);
    try {
      if (fieldData[name].required && !value) {
        throw new Error('This field is required');
      }
      await fieldData[name].validate(value);
      if (name in fieldErrorRefs) {
        fieldErrorRefs[name].current.innerText = '';
        fieldErrorRefs[name].current.style.setProperty('display', 'none');
      }
      return true;
    } catch (e) {
      if (name in fieldErrorRefs) {
        fieldErrorRefs[name].current.innerText = e.message;
        fieldErrorRefs[name].current.style.removeProperty('display');
      }
      return false;
    }
  }

  async function _validate() {
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
        ref.current.innerText = e.message;
        ref.current.style.removeProperty('display');
      });
      validated = false;
    }
    return validated;
  }

  function registerForm({ validate = null } = {}) {
    if (validate !== null) _formValidate = validate;

    setTimeout(() => {
      if (defaultValues === null) {
        defaultValues = getData();
      }
      reset();
    }, 0);

    return {
      onSubmit: async (event) => {
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
              ref.current.innerText = e.message;
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

  function register(name, { required = null, validate = null } = {}) {
    fieldData[name] ??= {};
    if (required !== null) fieldData[name].required = required;
    if (validate !== null) fieldData[name].validate = validate;
    if (!('required' in fieldData[name])) fieldData[name].required = false;
    if (!('validate' in fieldData[name]))
      fieldData[name].validate = async () => {};

    return {
      ref: (r) => {
        fieldRefs[name] = r;
      },
      [when]: async () => _validateField(name),
    };
  }

  function registerError(name = null) {
    return {
      ref: (r) => {
        if (name !== null) {
          fieldErrorRefs[name] = r;
        } else {
          formErrorRefs.push(r);
        }
      },
    };
  }

  function reset() {
    Object.keys(fieldRefs).forEach((name) => {
      _setFieldData(name, defaultValues[name]);
    });
  }

  return { registerForm, register, registerError, reset, getData, getErrors };
}
