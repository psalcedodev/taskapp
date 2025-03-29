export type Unsubscribe = () => void;

export interface Broadcast<T, TError = any> {
  readonly valueVersion: number;
  readonly errorVersion: number;
  getValue(): T;
  getError(): TError | null;
  onError(callback: (e: TError | null) => void): Unsubscribe;
  onChange(callback: (value: T) => void): Unsubscribe;
}

export interface Signal<T, TError = any> extends Broadcast<T, TError> {
  readonly valueVersion: number;
  readonly errorVersion: number;
  readonly broadcast: Broadcast<T, TError>;

  getValue(): T;
  setValue(value: T): void;
  transformValue(cb: (val: T) => T): void;
  onChange(callback: (value: T) => void): () => void;
  getError(): TError | null;
  setError(e: TError | null): void;
  onError(callback: (e: TError | null) => void): () => void;
  dispose(): void;
}
