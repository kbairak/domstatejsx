/*  TODOs:
  *  - selects
  *  - other components
  * */

class Form {
  constructor({ when = 'onChange', defaultValues = {} } = {}) {
    this.when = when;
    this.defaultValues = defaultValues;

    this.fieldRefs = {};
    this.errorRefs = {};
    this.buttonRef = null;
    this.validations = {};

    setTimeout(() => this.reset(), 0);
  }

  register = (name, { required = false, validate = [] } = {}) => {
    if (!(name in this.defaultValues)) {
      this.defaultValues[name] = '';
    }

    this.validations[name] = [];
    if (required) {
      this.validations[name].push((value) => value ? null : 'This field is required');
    }
    if (validate instanceof Array) {
      this.validations[name].push(...validate);
    } else {
      this.validations[name].push(validate);
    }

    return {
      ref: ({ current }) => { this.fieldRefs[name] = current; },
      [this.when]: (event) => {
        this.validateField(name, event.target.value);
        if (this.buttonRef !== null) {
          this.buttonRef.disabled = this.hasErrors();
        }
      }
    };
  };

  registerError = (name) => {
    return { ref: ({ current }) => { this.errorRefs[name] = current; } };
  };

  registerButton = () => {
    return { ref: ({ current }) => { this.buttonRef = current; } };
  };

  handleSubmit = (func) => {
    return (event) => {
      event.preventDefault();
      this.validateAll();
      if (!this.hasErrors()) {
        func(this.getData());
      } else {
        if (this.buttonRef !== null) { this.buttonRef.disabled = this.hasErrors(); }
      }
    };
  };

  reset = () => {
    Object.entries(this.defaultValues).forEach(([name, value]) => {
      if (name in this.fieldRefs) {
        this.fieldRefs[name].value = value;
      }
    });
    Object.values(this.errorRefs).forEach((element) => {
      element.style.setProperty('display', 'none');
      element.innerHTML = '';
    });
  };

  getData = () => {
    return Object.fromEntries(
      Object.entries(this.fieldRefs).map(([name, ref]) => [name, ref.value])
    );
  };

  getErrors = () => {
    return Object.fromEntries(
      Object.entries(this.errorRefs)
        .map(([name, element]) => [name, (
          element.tagName.toLowerCase() === 'ul' ?
            [...element.children].map((li) => li.textContent) :
            (element.textContent ? [element.textContent] : [])
        )])
    );
  };

  hasErrors = () => {
    return !!Object.values(this.getErrors()).find((errorlist) => errorlist.length);
  };

  validateField(name, value) {
    if (!(name in this.errorRefs)) return;
    const errors = this.validations[name]
      .map((validation) => validation(value))
      .filter((error) => error);
    const errorElement = this.errorRefs[name];
    if (errors.length) {
      errorElement.style.removeProperty('display');
      if (errorElement.tagName.toLowerCase() === 'ul') {
        errorElement.replaceChildren(...errors.map((error) => <li>{error}</li>));
      } else {
        this.errorRefs[name].textContent = errors.join(', ');
      }
    } else {
      errorElement.style.setProperty('display', 'none');
      errorElement.innerHTML = '';
    }
  }

  validateAll() {
    Object.entries(this.fieldRefs)
      .forEach(([name, element]) => this.validateField(name, element.value));
  }
}

export function useForm(props) {
  return new Form(props);
}
