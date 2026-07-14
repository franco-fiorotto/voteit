import { GetPollUseCase } from './GetPollUseCase';
import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { PollMother } from '@/contexts/polls/tests/PollMother';

describe('GetPollUseCase', () => {
  let repo: InMemoryPollRepo;
  let useCase: GetPollUseCase;

  beforeEach(() => {
    repo = new InMemoryPollRepo(new Map());
    useCase = new GetPollUseCase(repo);
  });

  it('returns found=true with the poll DTO when it exists', async () => {
    const poll = PollMother.create({ question: 'Exists?', options: ['A', 'B'] });
    await repo.save(poll);

    const result = await useCase.execute({ pollId: poll.id.toString() });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const response = result.value.getValue();
      expect(response.found).toBe(true);
      expect(response.poll?.question).toBe('Exists?');
    }
  });

  it('returns found=false when the poll does not exist', async () => {
    const result = await useCase.execute({ pollId: 'missing' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.getValue().found).toBe(false);
    }
  });
});
