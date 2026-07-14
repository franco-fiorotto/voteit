/**
 * Result<T> encodes success/failure without throwing. Domain factories and
 * value-object constructors return a Result so invariant violations are values,
 * not exceptions. Mirrors the reference `@wildmetrics/shared` building block.
 *
 * The constructor is `protected` so typed errors (see AppError / *Errors files)
 * can subclass Result and call `super(false, { message })`, while normal code
 * goes through the static `ok` / `fail` factories.
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly error: string | undefined;
  private readonly _value: T | undefined;

  protected constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error('A successful result cannot contain an error message.');
    }
    if (!isSuccess && !error) {
      throw new Error('A failing result needs to contain an error message.');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(
        `Cannot get the value of a failed result. Use getErrorValue() instead. Error: ${String(
          this.error,
        )}`,
      );
    }
    return this._value as T;
  }

  /** The failure message. Empty string on a successful result. */
  public getErrorValue(): string {
    return this.error ?? '';
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  /** Returns the first failing result, or a success if all succeed. */
  public static combine(results: Result<unknown>[]): Result<unknown> {
    for (const result of results) {
      if (result.isFailure) return result;
    }
    return Result.ok();
  }
}
