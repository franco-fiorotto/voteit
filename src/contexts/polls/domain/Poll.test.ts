import { Poll } from './Poll';

describe('Poll.create', () => {
  const validProps = { question: 'Best language?', options: ['TypeScript', 'Rust'] };

  it('creates a valid poll with zeroed votes', () => {
    const result = Poll.create(validProps);
    expect(result.isSuccess).toBe(true);

    const poll = result.getValue();
    expect(poll.question.value).toBe('Best language?');
    expect(poll.options).toHaveLength(2);
    expect(poll.totalVotes).toBe(0);
    expect(poll.options.every((o) => o.votes === 0)).toBe(true);
  });

  it('rejects a poll with fewer than MIN_OPTIONS', () => {
    const result = Poll.create({ question: 'Only one?', options: ['Solo'] });
    expect(result.isFailure).toBe(true);
  });

  it('rejects a poll with more than MAX_OPTIONS', () => {
    const options = Array.from({ length: Poll.MAX_OPTIONS + 1 }, (_, i) => `Option ${i}`);
    const result = Poll.create({ question: 'Too many?', options });
    expect(result.isFailure).toBe(true);
  });

  it('rejects a poll with an empty option label', () => {
    const result = Poll.create({ question: 'Blank?', options: ['Fine', '   '] });
    expect(result.isFailure).toBe(true);
  });

  it('rejects a poll with an invalid question', () => {
    const result = Poll.create({ question: '', options: ['A', 'B'] });
    expect(result.isFailure).toBe(true);
  });
});

describe('Poll.castVote', () => {
  it('increments the chosen option and the total', () => {
    const poll = Poll.create({ question: 'Pick one', options: ['A', 'B'] }).getValue();
    const optionId = poll.options[0].id.toString();

    const result = poll.castVote(optionId);

    expect(result.isSuccess).toBe(true);
    expect(poll.options[0].votes).toBe(1);
    expect(poll.options[1].votes).toBe(0);
    expect(poll.totalVotes).toBe(1);
  });

  it('fails for an option that does not belong to the poll', () => {
    const poll = Poll.create({ question: 'Pick one', options: ['A', 'B'] }).getValue();
    const result = poll.castVote('does-not-exist');
    expect(result.isFailure).toBe(true);
    expect(poll.totalVotes).toBe(0);
  });
});

describe('Poll.toDTO', () => {
  it('computes rounded percentages that reflect the votes', () => {
    const poll = Poll.create({ question: 'Pick one', options: ['A', 'B'] }).getValue();
    poll.castVote(poll.options[0].id.toString());
    poll.castVote(poll.options[0].id.toString());
    poll.castVote(poll.options[1].id.toString());

    const dto = poll.toDTO();
    expect(dto.totalVotes).toBe(3);
    expect(dto.options[0].percentage).toBe(67);
    expect(dto.options[1].percentage).toBe(33);
  });

  it('reports 0% for every option when there are no votes', () => {
    const poll = Poll.create({ question: 'Pick one', options: ['A', 'B'] }).getValue();
    const dto = poll.toDTO();
    expect(dto.options.every((o) => o.percentage === 0)).toBe(true);
  });
});

describe('Poll.reconstitute', () => {
  it('restores option ids and vote counts', () => {
    const created = Poll.create({ question: 'Pick one', options: ['A', 'B'] }).getValue();
    const snapshot = created.toDTO();

    const restored = Poll.reconstitute(
      {
        question: snapshot.question,
        createdAt: new Date(snapshot.createdAt),
        options: snapshot.options.map((o) => ({ id: o.id, label: o.label, votes: 5 })),
      },
      snapshot.id,
    ).getValue();

    expect(restored.id.toString()).toBe(snapshot.id);
    expect(restored.options[0].id.toString()).toBe(snapshot.options[0].id);
    expect(restored.totalVotes).toBe(10);
  });
});
