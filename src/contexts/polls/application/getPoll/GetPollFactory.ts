import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { GetPollUseCase } from './GetPollUseCase';

/** Composition root for the GetPoll use case (see CreatePollFactory). */
export class GetPollFactory {
  public static create(): GetPollUseCase {
    return new GetPollUseCase(new InMemoryPollRepo());
  }
}
