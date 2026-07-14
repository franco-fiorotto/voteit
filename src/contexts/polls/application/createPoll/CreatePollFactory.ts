import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { CreatePollUseCase } from './CreatePollUseCase';

/**
 * Composition root for the CreatePoll use case: wires the concrete repository
 * into the use case. The API layer (route handler) calls this — the domain and
 * application layers never reference infra directly. Swap the repo here to
 * change persistence for the whole use case.
 */
export class CreatePollFactory {
  public static create(): CreatePollUseCase {
    return new CreatePollUseCase(new InMemoryPollRepo());
  }
}
