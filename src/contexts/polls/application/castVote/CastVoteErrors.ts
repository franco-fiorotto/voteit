import { Result } from '@/shared/core/Result';
import { UseCaseError } from '@/shared/core/UseCaseError';

export namespace CastVoteErrors {
  /** No poll exists for the given id. */
  export class PollNotFound extends Result<UseCaseError> {
    public constructor(pollId: string) {
      super(false, `Poll "${pollId}" was not found`);
    }

    public static create(pollId: string): PollNotFound {
      return new PollNotFound(pollId);
    }
  }

  /** The poll exists but the option does not belong to it. */
  export class InvalidVote extends Result<UseCaseError> {
    public constructor(message: string) {
      super(false, message);
    }

    public static create(message: string): InvalidVote {
      return new InvalidVote(message);
    }
  }
}
