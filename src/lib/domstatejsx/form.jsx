/*  TODOs:
 *  - selects
 *  - other components
 * */

export function useForm({
  when = 'onChange',
  onSubmit,
  onSuccess = () => { },
  onError = () => { },
  onEnd = () => { },
  fields,
  validate = () => { },
  defaultValues = null,
}) {
  const fieldRefs = {};
  const fieldErrorRefs = {};
  const formErrorRefs = [];
  const fieldData = { ...fields };

  let formValidate = validate;

  function getData() {
    return Object.fromEntries(
      Object.entries(fieldRefs).map(([name, ref]) => [name, ref.current.value]),
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

  function _validateField(name) {
    const value = fieldRefs[name].current.value;
    try {
      if (fieldData[name].required && !value) {
        throw new Error('This field is required');
      }
      fieldData[name].validate(value);
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

  function _validate() {
    let validated = !Object.keys(fieldRefs).filter(
      (name) => !_validateField(name),
    ).length;
    try {
      formValidate(getData());
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
    if (validate !== null) formValidate = validate;

    setTimeout(() => {
      if (defaultValues === null) {
        defaultValues = getData();
      }
      reset();
    }, 0);

    return {
      onSubmit: async (event) => {
        event.preventDefault();

        if (!_validate()) {
          onError(getErrors());
          return;
        }

        try {
          await onSubmit(getData());
          formErrorRefs.forEach((ref) => {
            ref.current.innerText = '';
            ref.current.style.setProperty('display', 'none');
          });
          onSuccess(getData());
        } catch (e) {
          formErrorRefs.forEach((ref) => {
            ref.current.innerText = e.message;
            ref.current.style.removeProperty('display');
          });
          onError(getErrors());
        }
        onEnd(getData(), getErrors());
      },
    };
  }

  function register(name, { required = null, validate = null } = {}) {
    fieldData[name] ??= {};
    if (required !== null) fieldData[name].required = required;
    if (validate !== null) fieldData[name].validate = validate;
    if (!('required' in fieldData[name])) fieldData[name].required = false;
    if (!('validate' in fieldData[name])) fieldData[name].validate = () => { };

    return {
      ref: (r) => {
        fieldRefs[name] = r;
      },
      [when]: () => _validateField(name),
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
    Object.entries(fieldRefs).forEach(([name, ref]) => {
      ref.current.value = defaultValues[name];
    });
  }

  return { registerForm, register, registerError, reset, getData, getErrors };
}
