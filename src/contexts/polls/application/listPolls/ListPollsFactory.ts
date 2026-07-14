import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { ListPollsUseCase } from './ListPollsUseCase';

/** Composition root for the ListPolls use case (see CreatePollFactory). */
export class ListPollsFactory {
  public static create(): ListPollsUseCase {
    return new ListPollsUseCase(new InMemoryPollRepo());
  }
}
