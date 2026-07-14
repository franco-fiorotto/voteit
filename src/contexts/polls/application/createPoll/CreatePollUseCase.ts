import { UseCase } from '@/shared/core/UseCase';
import { Either, left, right } from '@/shared/core/Either';
import { Result } from '@/shared/core/Result';
import { AppError } from '@/shared/core/AppError';
import { IPollRepo } from '@/contexts/polls/domain/IPollRepo';
import { Poll, PollDTO } from '@/contexts/polls/domain/Poll';
import { CreatePollErrors } from './CreatePollErrors';

export interface CreatePollRequestDTO {
  question: string;
  options: string[];
}

export type CreatePollResponse = Either<
  CreatePollErrors.InvalidPoll | AppError.UnexpectedError,
  Result<PollDTO>
>;

/**
 * Creates a poll: validates it through the domain, persists it, and returns the
 * created poll as a DTO. Dependencies come in through the constructor (DI).
 */
export class CreatePollUseCase
  implements UseCase<CreatePollRequestDTO, Promise<CreatePollResponse>>
{
  constructor(private readonly pollRepo: IPollRepo) {}

  public async execute(request: CreatePollRequestDTO): Promise<CreatePollResponse> {
    try {
      const pollOrError = Poll.create({
        question: request.question,
        options: request.options,
      });

      if (pollOrError.isFailure) {
        return left(CreatePollErrors.InvalidPoll.create(pollOrError.getErrorValue()));
      }

      const poll = pollOrError.getValue();
      await this.pollRepo.save(poll);

      return right(Result.ok<PollDTO>(poll.toDTO()));
    } catch (error) {
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
