import { CreatePollUseCase } from './CreatePollUseCase';
import { CreatePollErrors } from './CreatePollErrors';
import { InMemoryPollRepo } from '@/contexts/polls/infra/repos/InMemoryPollRepo';

describe('CreatePollUseCase', () => {
  let repo: InMemoryPollRepo;
  let useCase: CreatePollUseCase;

  beforeEach(() => {
    repo = new InMemoryPollRepo(new Map());
    useCase = new CreatePollUseCase(repo);
  });

  it('creates and persists a valid poll', async () => {
    const result = await useCase.execute({
      question: 'Best pet?',
      options: ['Cat', 'Dog'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const dto = result.value.getValue();
      expect(dto.question).toBe('Best pet?');
      expect(dto.options).toHaveLength(2);
      expect(dto.totalVotes).toBe(0);
    }
    expect(repo.size).toBe(1);
  });

  it('returns InvalidPoll when the domain rejects the input', async () => {
    const result = await useCase.execute({ question: '', options: ['Only one'] });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CreatePollErrors.InvalidPoll);
    }
    expect(repo.size).toBe(0);
  });

  it('surfaces an unexpected error on the left channel', async () => {
    jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error('db down'));

    const result = await useCase.execute({ question: 'Valid?', options: ['A', 'B'] });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.getErrorValue()).toBe('db down');
    }
  });
});
