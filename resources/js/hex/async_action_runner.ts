import { ObservableValue } from '@/hex/observable_value.js';
import { WeakPromise } from '@/hex/weak_promise.js';
import { ActionBroadcast, Status } from '@/hooks/action_signal.js';

export type Action<T, TError = any> = (runner: AsyncActionRunner<T, TError>) => WeakPromise<T> | Promise<T>;

export type ReadonlyAsyncActionRunner<T, TError = any> = ActionBroadcast<T, TError>;

export class CancelledError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CancelledError';
  }
}

interface Context<T> {
  runner: AsyncActionRunner<T, any>;
  action: Action<T, unknown>;
  activePromise: WeakPromise<T>;
  initialValue: T;
  initialFeedback: string;
  feedback: ObservableValue<string>;
  progress: ObservableValue<number>;
  changeState(state: State<T>): void;
  setValue(value: T): void;
  getValue(): T;
  getError(): unknown | null;
  setError(error: unknown): void;
  notifyValue(): void;
  notifyError(): void;
}

function noop() {}

export class AsyncActionRunner<T, TError = any> extends ObservableValue<T, TError> implements ReadonlyAsyncActionRunner<T, TError> {
  private _internalState: State<T>;
  private _action: () => WeakPromise<T>;
  private _activePromise: WeakPromise<T>;
  private _status: ObservableValue<Status>;
  private _feedback: ObservableValue<string>;
  private _progress: ObservableValue<number>;

  get status() {
    return this._status.broadcast;
  }

  get feedback() {
    return this._feedback.broadcast;
  }

  get progress() {
    return this._progress.broadcast;
  }

  constructor(initialValue: T, initialFeedback = '') {
    super(initialValue);

    this._activePromise = WeakPromise.resolve(initialValue);
    this._action = () => this._activePromise;

    this._status = new ObservableValue<Status>(Status.INITIAL);
    this._feedback = new ObservableValue(initialFeedback);
    this._progress = new ObservableValue(0);

    const context: Context<T> = {
      runner: this,
      action: this._action,
      activePromise: this._activePromise,
      initialValue: initialValue,
      feedback: this._feedback,
      initialFeedback: initialFeedback,
      progress: this._progress,
      changeState: this.changeState,
      setValue: (value: T) => {
        this._value = value;
      },
      setError: (error: TError) => {
        this._error = error;
      },
      notifyValue: () => {
        super.setValue(this.getValue());
      },
      notifyError: () => {
        super.setError(this.getError());
      },
      getValue: () => {
        return this.getValue();
      },
      getError: () => {
        return this.getError();
      },
    };

    this._internalState = new InitialState<T>(context);
  }

  get broadcast(): ReadonlyAsyncActionRunner<T, TError> {
    return this;
  }

  private changeState = (state: State<T>) => {
    this._internalState = state;
    this._status.setValue(state.getName());
  };

  execute(action: Action<T, TError>) {
    this._internalState.cancel();
    return this._internalState.execute(action).catch((error) => {
      if (error instanceof CancelledError) {
        super.setError(null);
        return this.getValue();
      }
      throw error;
    });
  }

  setValue(value: T) {
    this._internalState.cancel();
    this._value = value;
    this._error = null;

    this.changeState(new SuccessState<T>(this._internalState.context));

    super.setValue(this._value);
    super.setError(this._error);
  }

  setError(error: TError | null) {
    this._internalState.cancel();
    this._error = error;

    this.changeState(new ErrorState<T>(this._internalState.context));

    super.setError(this._error);
  }

  setFeedback(feedback: string) {
    this._feedback.setValue(feedback);
  }

  setProgress(progress: number) {
    this._internalState.setProgress(progress);
  }

  dispatch(action: Action<T>) {
    return this.execute(action)
      .catch(() => {})
      .then(() => {});
  }

  cancel() {
    this._internalState.cancel();
  }

  retry() {
    return this._internalState.retry();
  }

  reset() {
    return this._internalState.reset();
  }

  dispose() {
    super.dispose();
    this._status.dispose();
    this._feedback.dispose();
  }
}

abstract class State<T> {
  context: Context<T>;

  constructor(context: Context<T>) {
    this.context = context;
  }

  abstract getName(): Status;

  execute(_action: Action<T>): Promise<T> {
    return Promise.reject(new Error('Not Yet Implemented'));
  }

  reset() {
    this.context.setError(null);
    this.context.setValue(this.context.initialValue);
    this.context.feedback.setValue(this.context.initialFeedback);
    this.context.changeState(new InitialState<T>(this.context));
  }

  retry(): Promise<T> {
    return Promise.reject(new Error('Not Yet Implemented'));
  }

  setProgress(_progress: number) {
    // Do nothing.
  }

  cancel() {}
}

class InitialState<T> extends State<T> {
  private _activeProgress: (progress: number) => void;
  private _setProgress: (progress: number) => void;
  private _noopSetProgress: (progress: number) => void;

  constructor(context: Context<T>) {
    super(context);

    this._noopSetProgress = noop;
    this._setProgress = (progress: number) => {
      this.context.progress.transformValue((v) => Math.min(1, Math.max(0, v, progress)));
    };

    this._activeProgress = this._noopSetProgress;
    this.context.progress.setValue(0);
  }

  getName() {
    return Status.INITIAL;
  }

  execute(action: Action<T>) {
    this._activeProgress = this._setProgress;
    this.context.action = action;
    const hasError = this.context.getError() != null;

    if (hasError) {
      this.context.setError(null);
      this.context.notifyError();
    }

    return new Promise<T>((resolve, reject) => {
      try {
        const originalPromise = action(this.context.runner);
        this.context.activePromise = WeakPromise.from(originalPromise);
        const pendingState = new PendingState<T>(this.context);
        this.context.changeState(pendingState);
      } catch (error) {
        this.context.setError(error);
        this.context.changeState(new ErrorState<T>(this.context));
        this.context.notifyError();
        reject(error);
      }

      this.context.activePromise
        .then((value) => {
          this.context.setValue(value);
          this.context.changeState(new SuccessState<T>(this.context));
          this.context.notifyValue();
          resolve(value);
        })
        .catch((error) => {
          if (!(error instanceof CancelledError)) {
            this.context.setError(error);
            this.context.changeState(new ErrorState<T>(this.context));
            this.context.notifyError();
          }
          reject(error);
        });
    });
  }

  setProgress(progress: number): void {
    this._activeProgress(progress);
  }

  retry(): Promise<T> {
    return Promise.reject(new Error("Invalid Action: Cannot retry a runner that hasn't run."));
  }
}

class PendingState<T> extends State<T> {
  cancel() {
    const error = new CancelledError();
    this.context.activePromise.cancel(error);
    this.context.setError(error);
    this.context.changeState(new ErrorState<T>(this.context));
    this.context.notifyError();
  }

  async execute(_action: Action<T>): Promise<T> {
    throw new Error('Invalid Action: Cannot execute on a pending async action.');
  }

  retry(): Promise<T> {
    return Promise.reject(new Error('Invalid Action: Cannot retry a runner that is pending.'));
  }

  reset() {
    this.cancel();
    this.context.setError(null);
    this.context.setValue(this.context.initialValue);
    this.context.feedback.setValue(this.context.initialFeedback);
    this.context.changeState(new InitialState<T>(this.context));
    this.context.notifyError();
    this.context.notifyValue();
  }

  getName() {
    return Status.PENDING;
  }

  setProgress(progress: number): void {
    this.context.progress.transformValue((v) => Math.min(1, Math.max(0, v, progress)));
  }
}

class SuccessState<T> extends State<T> {
  constructor(context: Context<T>) {
    super(context);
    this.context.progress.setValue(1);
  }

  getName() {
    return Status.SUCCESS;
  }

  execute(action: Action<T>): Promise<T> {
    const initialState = new InitialState(this.context);
    return initialState.execute(action);
  }

  retry(): Promise<T> {
    return Promise.reject(new Error('Invalid Action: Cannot retry a runner that is in a success state.'));
  }
}

class ErrorState<T> extends InitialState<T> {
  constructor(context: Context<T>) {
    super(context);
    this.context.progress.setValue(1);
  }

  retry() {
    const initialState = new InitialState(this.context);
    this.context.changeState(initialState);
    return initialState.execute(this.context.action);
  }

  execute(_action: Action<T>): Promise<T> {
    const initialState = new InitialState(this.context);
    return initialState.execute(_action);
  }

  getName() {
    return Status.ERROR;
  }
}

export { Status };
