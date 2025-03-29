function noop() {}

function isWeakPromise<T>(promise: any): promise is WeakPromise<T> {
  const isNull = promise == null;

  if (isNull) {
    return false;
  }

  const isPromise = promise instanceof Promise;
  const hasCancel = typeof promise.cancel === 'function';

  return isPromise && hasCancel;
}

function wrapValuesInWeakPromise(values: any) {
  return values.map((value: unknown) => {
    if (isWeakPromise(value)) {
      return value;
    } else if (value instanceof Promise) {
      return WeakPromise.from(value);
    } else {
      return WeakPromise.resolve(value);
    }
  });
}

export class WeakPromise<T> extends Promise<T> {
  private _onCancel: (reason: any) => void;
  private _reject: (reason: any) => void;
  private _parents: WeakPromise<unknown>[] = [];
  private _innerChains: WeakPromise<unknown>[] = [];

  constructor(callback: (resolve: any, reject: any) => (reason: any) => void) {
    let onCancel: (reason: any) => void = noop;
    let _reject = noop;

    // When the developer immediately resolves or rejects a promise we can't assign the
    // onCancel immediately to noop.

    // So the safelyClean does two jobs, before construction it detects if the promise
    // resolved or rejected immediate in order to determine if we need to save the clean up callback.
    // The second job is to remove the clean up once it resolves.
    let immediatelyResolved = false;
    let safelyClean = () => {
      immediatelyResolved = true;
    };

    super((resolve, reject) => {
      _reject = reject;
      onCancel = callback(
        (value: T) => {
          safelyClean();
          resolve(value);
        },
        (error: any) => {
          safelyClean();
          reject(error);
        },
      );
    });

    this._onCancel = (reason: any) => {
      if (onCancel != null) {
        onCancel(reason);
      }
    };

    // Now that we are done with invoking super. Lets reassign safelyClean to make it
    // impossible to invoke a clean up twice.
    safelyClean = () => {
      this._onCancel = noop;
      this._parents.length = 0;
    };

    this._reject = _reject;

    if (immediatelyResolved) {
      this._onCancel = noop;
    }
  }

  cancel(reason: any) {
    this.catch(() => {});
    this._onCancel(reason);
    this._innerChains.forEach(c => c.cancel(reason));
    this._parents.forEach(p => p.cancel(reason));
    this._onCancel = noop;
    this._parents.length = 0;
    this._innerChains.length = 0;
    this._reject(reason);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): WeakPromise<TResult1 | TResult2> {
    const promise = super.then(
      (value: T) => {
        if (onfulfilled != null) {
          const returnedValue = onfulfilled(value);
          if (isWeakPromise<TResult1 | TResult2>(returnedValue)) {
            promise._innerChains.push(returnedValue);
          }
          return returnedValue;
        }
        return value;
      },
      error => {
        if (onrejected != null) {
          const returnedValue = onrejected(error);
          if (isWeakPromise<TResult1 | TResult2>(returnedValue)) {
            promise._innerChains.push(returnedValue);
          }
          return returnedValue;
        }
        throw error;
      },
    ) as WeakPromise<TResult1 | TResult2>;

    promise._parents.push(this);
    return promise;
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): WeakPromise<T | TResult> {
    const promise = super.catch(error => {
      if (onrejected != null) {
        const returnedValue = onrejected(error);
        if (isWeakPromise<TResult>(returnedValue)) {
          promise._innerChains.push(returnedValue);
        }
        return returnedValue;
      }
    }) as WeakPromise<T | TResult>;
    promise._parents.push(this);
    return promise;
  }

  finally(onfinally?: (() => void) | undefined | null): WeakPromise<T> {
    const promise = super.finally(onfinally) as WeakPromise<T>;
    promise._parents.push(this);
    return promise;
  }

  static resolve(): WeakPromise<void>;
  static resolve<T>(value: T | PromiseLike<T>): WeakPromise<T>;
  static resolve<T>(value?: unknown): WeakPromise<void> | WeakPromise<T> {
    const isPromiseLike = value && typeof (value as any).then === 'function';

    if (isPromiseLike) {
      return new WeakPromise<T>((resolve, reject) => {
        (value as any).then(resolve, reject);
        return noop;
      });
    }

    return new WeakPromise<T>(resolve => {
      resolve(value);
      return noop;
    });
  }

  static reject<T = never>(reason?: any): WeakPromise<T> {
    return new WeakPromise((_resolve, reject) => {
      reject(reason);
      return noop;
    });
  }

  static all<T extends readonly unknown[] | []>(
    values: T,
  ): WeakPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
    if (values.length === 0) {
      return WeakPromise.resolve<{ -readonly [P in keyof T]: Awaited<T[P]> }>(
        [] as any,
      );
    }

    return new WeakPromise((resolve, reject) => {
      const resolveValues: ({ value: unknown } | null)[] = new Array(
        values.length,
      );
      resolveValues.fill(null);

      function fulfill(value: unknown, index: number) {
        resolveValues[index] = { value };

        const allSettled = resolveValues.every(v => v != null);
        if (allSettled) {
          resolve(resolveValues.map(v => v?.value));
        }
      }

      function stop(reason: any) {
        weakPromises.forEach((p: { cancel: (arg0: any) => any }) =>
          p.cancel(reason),
        );
        reject(reason);
      }

      const weakPromises = wrapValuesInWeakPromise(values);

      weakPromises.forEach((p: Promise<any>, index: number) =>
        p.then((v: unknown) => fulfill(v, index)).catch(stop),
      );

      return reason => {
        weakPromises.forEach((p: { cancel: (arg0: any) => any }) =>
          p.cancel(reason),
        );
      };
    });
  }

  static allSettled<T extends readonly unknown[] | []>(
    values: T,
  ): WeakPromise<{
    -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>;
  }> {
    if (values.length === 0) {
      return WeakPromise.resolve<{
        -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>;
      }>([] as any);
    }

    return new WeakPromise(resolve => {
      const results: unknown[] = new Array(values.length);
      results.fill(null);

      function fulfill(value: any, index: number) {
        results[index] = { status: 'fulfilled', value };
        const allSettled = results.every(v => v != null);

        if (allSettled) {
          resolve(results);
        }
      }

      function reject(reason: any, index: number) {
        results[index] = { status: 'rejected', reason };
        weakPromises.forEach((p: { cancel: (arg0: any) => any }) =>
          p.cancel(reason),
        );

        const allSettled = results.every(v => v != null);
        if (allSettled) {
          resolve(results);
        }
      }

      const weakPromises = wrapValuesInWeakPromise(values);

      weakPromises.forEach((p: Promise<any>, index: number) =>
        p
          .then((v: any) => fulfill(v, index))
          .catch((e: any) => reject(e, index)),
      );

      return reason => {
        weakPromises.forEach((p: { cancel: (arg0: any) => any }) =>
          p.cancel(reason),
        );
      };
    });
  }

  static from<T>(
    promise: Promise<T>,
    onCancel: (reason: any) => void = noop,
  ): WeakPromise<T> {
    if (isWeakPromise<T>(promise)) {
      return promise;
    }

    return new WeakPromise((resolve, reject) => {
      promise.then(resolve).catch(reject);
      return onCancel;
    });
  }
}
