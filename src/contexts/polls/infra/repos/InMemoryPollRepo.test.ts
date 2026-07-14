import { InMemoryPollRepo } from './InMemoryPollRepo';
import { PollMother } from '@/contexts/polls/tests/PollMother';

describe('InMemoryPollRepo', () => {
  let repo: InMemoryPollRepo;

  beforeEach(() => {
    repo = new InMemoryPollRepo(new Map());
  });

  it('saves and retrieves a poll by id', async () => {
    const poll = PollMother.create({ question: 'Coffee or tea?', options: ['Coffee', 'Tea'] });
    await repo.save(poll);

    const found = await repo.getById(poll.id.toString());
    expect(found).not.toBeNull();
    expect(found?.question.value).toBe('Coffee or tea?');
    expect(found?.options).toHaveLength(2);
  });

  it('returns null for an unknown id', async () => {
    expect(await repo.getById('missing')).toBeNull();
  });

  it('persists vote counts across save/read', async () => {
    const poll = PollMother.withVotes(3);
    await repo.save(poll);

    const found = await repo.getById(poll.id.toString());
    expect(found?.totalVotes).toBe(3);
  });

  it('does not leak later mutations into a previously saved snapshot', async () => {
    const poll = PollMother.create();
    await repo.save(poll);

    // Mutate the aggregate AFTER saving — the store should be unaffected.
    poll.castVote(poll.options[0].id.toString());

    const found = await repo.getById(poll.id.toString());
    expect(found?.totalVotes).toBe(0);
  });

  it('lists all polls newest first', async () => {
    const older = PollMother.create({ question: 'Older?', options: ['A', 'B'] });
    const newer = PollMother.create({ question: 'Newer?', options: ['A', 'B'] });
    // Force a deterministic ordering regardless of clock resolution.
    (newer as unknown as { props: { createdAt: Date } }).props.createdAt = new Date(
      older.createdAt.getTime() + 1000,
    );

    await repo.save(older);
    await repo.save(newer);

    const all = await repo.getAll();
    expect(all).toHaveLength(2);
    expect(all[0].question.value).toBe('Newer?');
  });
});
