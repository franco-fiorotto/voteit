import { Poll } from '@/contexts/polls/domain/Poll';

/**
 * Object Mother for building valid Poll aggregates in tests with sensible
 * defaults and targeted overrides.
 */
export class PollMother {
  public static create(overrides: { question?: string; options?: string[] } = {}): Poll {
    const result = Poll.create({
      question: overrides.question ?? 'Favourite season?',
      options: overrides.options ?? ['Summer', 'Autumn', 'Winter', 'Spring'],
    });
    return result.getValue();
  }

  /** A poll that already has some votes recorded on its first option. */
  public static withVotes(votes: number): Poll {
    const poll = PollMother.create();
    const optionId = poll.options[0].id.toString();
    for (let i = 0; i < votes; i += 1) poll.castVote(optionId);
    return poll;
  }
}
