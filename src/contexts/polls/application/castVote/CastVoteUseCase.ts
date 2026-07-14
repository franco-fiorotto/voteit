import { UseCase } from '@/shared/core/UseCase';
import { Either, left, right } from '@/shared/core/Either';
import { Result } from '@/shared/core/Result';
import { AppError } from '@/shared/core/AppError';
import { IPollRepo } from '@/contexts/polls/domain/IPollRepo';
import { PollDTO } from '@/contexts/polls/domain/Poll';
import { CastVoteErrors } from './CastVoteErrors';

export interface CastVoteRequestDTO {
  pollId: string;
  optionId: string;
}

export type CastVoteResponse = Either<
  CastVoteErrors.PollNotFound | CastVoteErrors.InvalidVote | AppError.UnexpectedError,
  Result<PollDTO>
>;

/**
 * Records a vote against a poll option and returns the updated poll. Loads the
 * aggregate, delegates the invariant (option must belong to the poll) to the
 * domain, then persists.
 */
export class CastVoteUseCase implements UseCase<CastVoteRequestDTO, Promise<CastVoteResponse>> {
  constructor(private readonly pollRepo: IPollRepo) {}

  public async execute(request: CastVoteRequestDTO): Promise<CastVoteResponse> {
    try {
      const poll = await this.pollRepo.getById(request.pollId);
      if (!poll) {
        return left(CastVoteErrors.PollNotFound.create(request.pollId));
      }

      const voteOrError = poll.castVote(request.optionId);
      if (voteOrError.isFailure) {
        return left(CastVoteErrors.InvalidVote.create(voteOrError.getErrorValue()));
      }

      await this.pollRepo.save(poll);

      return right(Result.ok<PollDTO>(poll.toDTO()));
    } catch (error) {
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
