import { Broadcast } from '@/hooks/signal.js';

export type Unsubscribe = () => void;
export type ReadonlyObservableValue<T, TError = any> = Broadcast<T, TError>;

export class ObservableValue<T, TError = any> implements ReadonlyObservableValue<T, TError> {
  protected key: string | undefined;
  protected _valueVersion = 0;
  protected _errorVersion = 0;
  protected _value: T;
  protected _error: TError | null = null;

  readonly valueCallbacks: ((value: T) => void)[] = [];
  readonly errorCallbacks: ((error: TError | null) => void)[] = [];

  get valueVersion() {
    return this._valueVersion;
  }

  get errorVersion() {
    return this._errorVersion;
  }

  get broadcast(): ReadonlyObservableValue<T, TError> {
    return this;
  }

  constructor(initialState: T) {
    this._value = initialState;
  }

  getValue() {
    return this._value;
  }

  setValue(value: T) {
    this._value = value;
    this._valueVersion++;
    this.notify(value);
  }

  transformValue(cb: (val: T) => T) {
    const value = cb(this._value);
    this.setValue(value);
  }

  onChange(callback: (value: T) => void) {
    const unsubscribe = () => {
      const index = this.valueCallbacks.indexOf(callback);
      if (index > -1) {
        this.valueCallbacks.splice(index, 1);
      }
    };

    this.valueCallbacks.push(callback);
    return unsubscribe;
  }

  setError(e: TError | null) {
    this._error = e;
    this._errorVersion++;
    this.notifyError(e);
  }

  getError() {
    return this._error;
  }

  onError(callback: (e: TError | null) => void) {
    const unsubscribe = () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };

    this.errorCallbacks.push(callback);
    return unsubscribe;
  }

  dispose() {
    this.disposeCallbacks();
  }

  private notify(value: T) {
    let potentialError: any | null = null;

    this.valueCallbacks.forEach((callback) => {
      try {
        callback(value);
      } catch (e) {
        if (potentialError == null) {
          potentialError = e;
        }
      }
    });

    if (potentialError != null) {
      throw potentialError;
    }
  }

  private notifyError(error: TError | null) {
    let potentialError: any | null = null;

    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (e) {
        if (potentialError == null) {
          potentialError = e;
        }
      }
    });

    if (potentialError != null) {
      throw potentialError;
    }
  }

  private disposeCallbacks() {
    this.valueCallbacks.length = 0;
    this.errorCallbacks.length = 0;
  }
}
