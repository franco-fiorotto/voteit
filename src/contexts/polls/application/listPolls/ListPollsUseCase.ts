import { UseCase } from '@/shared/core/UseCase';
import { Either, left, right } from '@/shared/core/Either';
import { Result } from '@/shared/core/Result';
import { AppError } from '@/shared/core/AppError';
import { IPollRepo } from '@/contexts/polls/domain/IPollRepo';
import { PollDTO } from '@/contexts/polls/domain/Poll';

export type ListPollsResponse = Either<AppError.UnexpectedError, Result<PollDTO[]>>;

/** Lists every poll (newest first), as DTOs, for the home page. */
export class ListPollsUseCase implements UseCase<void, Promise<ListPollsResponse>> {
  constructor(private readonly pollRepo: IPollRepo) {}

  public async execute(): Promise<ListPollsResponse> {
    try {
      const polls = await this.pollRepo.getAll();
      return right(Result.ok<PollDTO[]>(polls.map((poll) => poll.toDTO())));
    } catch (error) {
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
