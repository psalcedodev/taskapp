import { WeakPromise } from '@/hex/weak_promise';
import { Broadcast } from '@/hooks/signal.js';

export enum Status {
  INITIAL = 'initial',
  PENDING = 'pending',
  ERROR = 'error',
  SUCCESS = 'success',
}

export type Action<T, TError = unknown> = (actionSignal: ActionSignal<T, TError>) => WeakPromise<T> | Promise<T>;

export interface ActionBroadcast<T, TError = any> extends Broadcast<T, TError> {
  status: Broadcast<Status>;
  feedback: Broadcast<string>;
  progress: Broadcast<number>;
  retry(): Promise<T>;
  cancel(): void;
  reset(): void;
}

export interface ActionSignal<T, TError = any> extends ActionBroadcast<T, TError> {
  execute(action: Action<T, TError>): Promise<T>;
  setValue(value: T): void;
  transformValue(cb: (val: T) => T): void;
  setError(error: TError | null): void;
  setFeedback(feedback: string): void;
  setProgress(progress: number): void;
  dispatch(action: Action<T>): Promise<void>;
  dispose(): void;
}
