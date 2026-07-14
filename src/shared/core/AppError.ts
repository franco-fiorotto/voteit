import { Result } from './Result';
import { UseCaseError } from './UseCaseError';

/**
 * Catch-all error placed on the `left` channel when a use case hits something
 * unexpected (a thrown exception). Keeps the boundary total: callers always get
 * a value, never an escaped exception.
 */
export namespace AppError {
  export class UnexpectedError extends Result<UseCaseError> {
    public constructor(err: unknown) {
      const message =
        err instanceof Error ? err.message : `An unexpected error occurred: ${String(err)}`;
      super(false, message);
    }

    public static create(err: unknown): UnexpectedError {
      return new UnexpectedError(err);
    }
  }
}
