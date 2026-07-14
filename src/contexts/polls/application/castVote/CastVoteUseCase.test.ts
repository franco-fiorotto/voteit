import { CastVoteUseCase } from './CastVoteUseCase';
import { CastVoteErrors } from './CastVoteErrors';
import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';
import { PollMother } from '@/contexts/polls/tests/PollMother';

describe('CastVoteUseCase', () => {
  let repo: InMemoryPollRepo;
  let useCase: CastVoteUseCase;

  beforeEach(() => {
    repo = new InMemoryPollRepo(new Map());
    useCase = new CastVoteUseCase(repo);
  });

  it('records a vote and returns the updated poll', async () => {
    const poll = PollMother.create({ question: 'Pick', options: ['A', 'B'] });
    await repo.save(poll);
    const optionId = poll.options[0].id.toString();

    const result = await useCase.execute({ pollId: poll.id.toString(), optionId });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const dto = result.value.getValue();
      expect(dto.totalVotes).toBe(1);
      expect(dto.options.find((o) => o.id === optionId)?.votes).toBe(1);
    }

    // Persisted, not just returned.
    const reloaded = await repo.getById(poll.id.toString());
    expect(reloaded?.totalVotes).toBe(1);
  });

  it('returns PollNotFound for an unknown poll', async () => {
    const result = await useCase.execute({ pollId: 'nope', optionId: 'x' });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CastVoteErrors.PollNotFound);
    }
  });

  it('returns InvalidVote for an option not on the poll', async () => {
    const poll = PollMother.create({ question: 'Pick', options: ['A', 'B'] });
    await repo.save(poll);

    const result = await useCase.execute({ pollId: poll.id.toString(), optionId: 'ghost' });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CastVoteErrors.InvalidVote);
    }
  });
});
