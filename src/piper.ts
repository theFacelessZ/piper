export type PipeFunction<TResult = unknown, T = unknown> = (x: T) => TResult;

export class Piper<T = unknown> {
  constructor(protected readonly _value: T) {}

  /**
   * Pipes the last piper value to a pipe function regarding of promises.
   *
   * @param func
   *   A pipe function.
   */
  pipeSync<TResult = unknown>(func: PipeFunction<TResult, T>): Piper<TResult> {
    return new Piper(func(this._value));
  }

  /**
   * Pipes the last piper value to a pipe function.
   *
   * @param func
   *   A pipe function.
   */
  pipe<TResult = unknown>(
    func: PipeFunction<TResult, Awaited<T>>
  ): T extends Promise<Awaited<T>>
    ? Piper<Promise<Awaited<TResult>>>
    : Piper<TResult> {
    // Chain promises, making the piper awaitable by default.
    if (this._value instanceof Promise) {
      return new Piper(
        this._value.then(result => func(result)) as never
      ) as never;
    }

    // At this point we're sure that since the current value is not a promise, there's
    // nothing to await, hence.
    return this.pipeSync(func as never) as never;
  }

  /**
   * Returns currently stored piper value.
   */
  get value() {
    return this._value;
  }

  /**
   * Returns currently stored piper value.
   */
  valueOf(): T {
    return this._value;
  }

  /**
   * Piper to string conversion.
   */
  toString() {
    return `${this._value}`;
  }
}

/**
 * Shortcut for piper initialisation.
 *
 * @param initialValue
 *   Piper initial value.
 */
export const pipe = <T, TResult extends T | unknown = T>(
  initialValue: T
): Piper<TResult> => {
  return new Piper<TResult>(initialValue as TResult);
};
