import { ListPollsUseCase } from './ListPollsUseCase';
import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { PollMother } from '@/contexts/polls/tests/PollMother';

describe('ListPollsUseCase', () => {
  let repo: InMemoryPollRepo;
  let useCase: ListPollsUseCase;

  beforeEach(() => {
    repo = new InMemoryPollRepo(new Map());
    useCase = new ListPollsUseCase(repo);
  });

  it('returns an empty list when there are no polls', async () => {
    const result = await useCase.execute();
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.getValue()).toEqual([]);
    }
  });

  it('returns all polls as DTOs', async () => {
    await repo.save(PollMother.create({ question: 'One?', options: ['A', 'B'] }));
    await repo.save(PollMother.create({ question: 'Two?', options: ['A', 'B'] }));

    const result = await useCase.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const dtos = result.value.getValue();
      expect(dtos).toHaveLength(2);
      expect(dtos.map((d) => d.question).sort()).toEqual(['One?', 'Two?']);
    }
  });
});
