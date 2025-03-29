import { AsyncActionRunner, CancelledError } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import copy from 'fast-copy';
type FieldDomainCallback<T> = (field: FieldDomain<T>) => void;
export interface InitialOptions<T> {
  label?: string;
  isDisabled?: boolean;
  isFocused?: boolean;
  hasBeenTouched?: boolean;
  description?: string;
  onChangeCallback?: FieldDomainCallback<T>;
  onBlurCallback?: FieldDomainCallback<T>;
  onFocusCallback?: FieldDomainCallback<T>;
  validate?: (field: FieldDomain<T>) => Promise<void> | void;
  equalityOperatorCallback?: (oldValue: T, newValue: T) => boolean;
  isEmptyCallback?: (value: T) => boolean;
  shouldValidateOnBlur?: boolean;
  shouldValidateOnChange?: boolean;
  shouldValidateOnSubmit?: boolean;
  cloneValue?: (value: T) => T; // this is used to set the initial value of the field; (useful if cloning objects)
}

function defaultCloneValue<T>(value: T) {
  return copy(value);
}
const noop = () => {};
export class FieldDomain<T> {
  private _value: T;
  private _initialValue: T;
  private _name: string;
  private _label: string;
  private _isDisabled: boolean;
  private _isFocused: boolean;
  private _hasBeenTouched: boolean;
  private _description?: string;
  private _onChangeCallback: FieldDomainCallback<T>;
  private _onBlurCallback: FieldDomainCallback<T>;
  private _onFocusCallback: FieldDomainCallback<T>;
  private _cloneValue: (value: T) => T;
  private _validate: (field: FieldDomain<T>) => Promise<void> | void;
  private _equalityOperator: (oldValue: T, newValue: T) => boolean;
  isEmpty: (value: T) => boolean;
  state = new ObservableValue<FieldDomain<T>>(this);
  validationRunner: AsyncActionRunner<void> = new AsyncActionRunner<void>(undefined);

  /** Determines if the field should validate on blur. */
  shouldValidateOnBlur: boolean;
  /** Determines if the field should validate on change. */
  shouldValidateOnChange: boolean;
  /** Determines if the field should validate on form submission. */
  shouldValidateOnSubmit: boolean;
  constructor(
    name: string,
    value: T,
    {
      label = '',
      isDisabled = false,
      isFocused = false,
      hasBeenTouched = false,
      description,
      onChangeCallback = noop,
      onBlurCallback = noop,
      onFocusCallback = noop,
      validate = () => Promise.resolve(),
      equalityOperatorCallback: equaityOperatorCallback = (o, n) => o === n,
      isEmptyCallback = (value: T) => !value,
      shouldValidateOnBlur = false,
      shouldValidateOnChange = false,
      shouldValidateOnSubmit = false,
      cloneValue = defaultCloneValue,
    }: InitialOptions<T> = {},
  ) {
    this._name = name;
    this._value = value;
    this._cloneValue = cloneValue;
    this._initialValue = this._cloneValue(value);
    this._label = label === '' ? this.getNameAsLabel(name) : label;
    this._isDisabled = isDisabled;
    this._isFocused = isFocused;
    this._hasBeenTouched = hasBeenTouched;
    this._description = description;
    this._onChangeCallback = onChangeCallback;
    this._onBlurCallback = onBlurCallback;
    this._onFocusCallback = onFocusCallback;
    this._validate = validate;
    this._equalityOperator = equaityOperatorCallback;
    this.isEmpty = isEmptyCallback;
    this.shouldValidateOnBlur = shouldValidateOnBlur;
    this.shouldValidateOnChange = shouldValidateOnChange;
    this.shouldValidateOnSubmit = shouldValidateOnSubmit;
  }
  getNameAsLabel(name: string): string {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Gets the name of the field.
   */
  getName() {
    return this._name;
  }

  /**
   * Sets the name of the field.
   * @param name New name.
   */
  setName(name: string) {
    if (name === this._name) {
      return;
    }
    this._name = name;
    this.state.setValue(this);
  }

  /**
   * Gets the label of the input.
   */
  getLabel() {
    return this._label;
  }

  /**
   * Sets the label of the field.
   * @param label New Label
   */
  setLabel(label: string) {
    if (label === this._label) {
      return;
    }
    this._label = label;
    this.state.setValue(this);
  }

  /**
   * Gets the value of the field.
   */
  getValue(): T {
    if (!this._value && !this._hasBeenTouched) {
      return this._cloneValue(this._initialValue);
    }
    return this._value;
  }

  /**
   * Sets the value of th field.
   * @param value New Value.
   */
  setValue(value: T) {
    if (this._equalityOperator(this._value, value)) {
      return;
    }
    this._value = value;
    this.state.setValue(this);
    this._onChangeCallback(this);
    if (this.shouldValidateOnChange) {
      this.validate().catch(() => {
        // Do nothing, let this be handled by the field state.
      });
    }
  }
  transformValue(cb: (val: T) => T) {
    const value = cb(this._value);
    this.setValue(value);
  }

  /**
   * Gets the description of the field.
   */
  getDescription() {
    return this._description;
  }

  /**
   * Sets the description of the field.
   * @param description New Description.
   */
  setDescription(description: string | undefined) {
    if (description === this._description) {
      return;
    }
    this._description = description;
    this.state.setValue(this);
  }

  /**
   * Checks if its disabled or not.
   */
  getIsDisabled() {
    return this._isDisabled;
  }

  /**
   * Sets the field is disabled or not.
   * @param value New Value
   */
  setIsDisabled(value: boolean) {
    if (value !== this._isDisabled) {
      this._isDisabled = value;
      this.state.setValue(this);
    }
  }

  /**
   * Sets the onChange callback for this field.
   * @param onChangeCallback
   */
  setOnChangeCallback(onChangeCallback: (field: FieldDomain<T>) => void) {
    this._onChangeCallback = onChangeCallback;
  }

  /**
   * Allows for custom handling of whether or not a field is empty. Things like options
   * and numbers may not be considered empty or filled based on truthy or falsy. This allows
   * for that customization. The default is all falsy values are considered empty.
   * "", 0, null, undefined are all considered empty.
   * @param isEmptyCallback The callback to check if its empty.
   */
  setIsEmptyCallback(isEmptyCallback: (value: T) => boolean) {
    this.isEmpty = isEmptyCallback;
  }

  /**
   * Sets a custom equality operator.
   */
  setEqualityOperator(equalityOperator: (oldValue: T, newValue: T) => boolean) {
    this._equalityOperator = equalityOperator;
  }

  /**
   * Gets the onChange callback for this field.
   */
  getOnChangeCallback() {
    return this._onChangeCallback;
  }

  /**
   * Sets the onBlur callback.
   * @param onBlurCallback
   */
  setOnBlurCallback(onBlurCallback: (field: FieldDomain<T>) => void) {
    this._onBlurCallback = onBlurCallback;
  }

  /**
   * Gets the onBlur callback.
   */
  getOnBlurCallback() {
    return this._onBlurCallback;
  }

  /**
   * Sets the onFocus callback.
   * @param onFocusCallback
   */
  setOnFocusCallback(onFocusCallback: (field: FieldDomain<T>) => void) {
    this._onFocusCallback = onFocusCallback;
  }

  /**
   * Gets the onFocus callback.
   */
  getOnFocusCallback() {
    return this._onFocusCallback;
  }

  /**
   * Sets the validate callback;
   * @param validate
   */
  setValidateCallback(validate: (field: FieldDomain<T>) => Promise<void> | void) {
    this._validate = validate;
  }

  /**
   * Gets the validate callback;
   */
  getValidateCallback() {
    return this._validate;
  }

  /**
   * Helper function to enable the field.
   */
  enable() {
    this.setIsDisabled(false);
  }

  /**
   * Helper function to disable the field.
   */
  disable() {
    this.setIsDisabled(true);
  }

  /**
   * Get the initialValue of the field.
   */
  getInitialValue() {
    return this._initialValue;
  }

  /**
   * Sets the initialValue.
   * @param value New Value
   */
  setInitialValue(value: T) {
    this._value = value;
    this._initialValue = this._cloneValue(value);
  }

  /**
   * Sets the error of the field.
   * @param error New Error.
   */
  setError(error: Error) {
    if (error.message === this.state.getError()?.message) {
      return;
    }
    this.state.setError(error);
  }

  /**
   * Gets the error of the field.
   */
  getError() {
    return this.state.getError();
  }

  /**
   * Clears any errors.
   */
  clearError() {
    if (this.state.getError() != null) {
      this.state.setError(null);
    }
  }

  /**
   * Checks if the field has been touched.
   */
  isTouched() {
    return this._hasBeenTouched;
  }

  /**
   * Marks the field as touched.
   */
  touch() {
    if (!this._hasBeenTouched) {
      this._hasBeenTouched = true;
      this.state.setValue(this);
    }
  }

  /**
   * Checks if the field has been focused.
   */
  isFocused() {
    return this._isFocused;
  }

  /**
   * Focuses the field
   */
  focus() {
    if (!this._isFocused) {
      this._isFocused = true;
      this.state.setValue(this);
      this._onFocusCallback(this);
    }
  }

  /**
   * Blurs the field.
   */
  blur() {
    if (this._isFocused) {
      this._isFocused = false;
      this.state.setValue(this);
      this._onBlurCallback(this);
      if (this.shouldValidateOnBlur) {
        this.validate().catch(() => {
          // Let the error handling happen on the field state.
        });
      }
    }
  }

  /**
   * Validate the field.
   */
  async validate() {
    const action = async () => {
      return Promise.resolve()
        .then(() => {
          return this._validate(this);
        })
        .then(() => {
          this.clearError();
        });
    };
    this.validationRunner.reset();
    return this.validationRunner.execute(action).catch((e) => {
      if (!(e instanceof CancelledError)) {
        this.setError(e);
      }
      throw e;
    });
  }

  /**
   * Checks to see if the value is equal to the initialValue.
   */
  isPristine() {
    return this._equalityOperator(this._value, this._initialValue);
  }

  /**
   * This saves the current value as the initial value, and removes the touched state.
   */
  upgrade() {
    if (this._value !== this._initialValue) {
      this._initialValue = this._cloneValue(this._value);
      this._hasBeenTouched = false;
      this.state.setValue(this);
    }
  }

  /**
   * Sets the value back to the initial value and removes the touched state.
   */
  reset() {
    if (this._hasBeenTouched || this._value !== this._initialValue) {
      this._hasBeenTouched = false;
      this.setValue(this._cloneValue(this._initialValue));
    }
  }

  /**
   * Clean up observable value.
   */
  dispose() {
    this.state.dispose();
  }
}
