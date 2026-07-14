import { UseCase } from '@/shared/core/UseCase';
import { Either, left, right } from '@/shared/core/Either';
import { Result } from '@/shared/core/Result';
import { AppError } from '@/shared/core/AppError';
import { IPollRepo } from '@/contexts/polls/domain/IPollRepo';
import { PollDTO } from '@/contexts/polls/domain/Poll';

export interface GetPollRequestDTO {
  pollId: string;
}

export interface GetPollResponseDTO {
  found: boolean;
  poll?: PollDTO;
}

export type GetPollResponse = Either<AppError.UnexpectedError, Result<GetPollResponseDTO>>;

/**
 * Fetches a single poll. A missing poll is not an error — it is a successful
 * query with `found: false`, so the adapter decides the HTTP status.
 */
export class GetPollUseCase implements UseCase<GetPollRequestDTO, Promise<GetPollResponse>> {
  constructor(private readonly pollRepo: IPollRepo) {}

  public async execute(request: GetPollRequestDTO): Promise<GetPollResponse> {
    try {
      const poll = await this.pollRepo.getById(request.pollId);
      if (!poll) {
        return right(Result.ok<GetPollResponseDTO>({ found: false }));
      }
      return right(Result.ok<GetPollResponseDTO>({ found: true, poll: poll.toDTO() }));
    } catch (error) {
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
