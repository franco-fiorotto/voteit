import { Result } from '@/shared/core/Result';
import { UseCaseError } from '@/shared/core/UseCaseError';

export namespace CreatePollErrors {
  /** The submitted poll violated a domain invariant (bad question, options…). */
  export class InvalidPoll extends Result<UseCaseError> {
    public constructor(message: string) {
      super(false, message);
    }

    public static create(message: string): InvalidPoll {
      return new InvalidPoll(message);
    }
  }
}
