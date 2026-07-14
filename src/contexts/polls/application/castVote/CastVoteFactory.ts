import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { CastVoteUseCase } from './CastVoteUseCase';

/** Composition root for the CastVote use case (see CreatePollFactory). */
export class CastVoteFactory {
  public static create(): CastVoteUseCase {
    return new CastVoteUseCase(new InMemoryPollRepo());
  }
}
