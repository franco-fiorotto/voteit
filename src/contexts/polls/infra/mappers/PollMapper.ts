import { Poll } from '@/contexts/polls/domain/Poll';

/** Flat, serialisable persistence shape for a poll (what a DB row would hold). */
export interface PollRecord {
  id: string;
  question: string;
  createdAt: string;
  options: { id: string; label: string; votes: number }[];
}

/**
 * Translates between the Poll aggregate and its persistence record. Keeping this
 * boundary explicit means the domain never leaks into storage and swapping the
 * store (e.g. to Postgres) only touches infra.
 */
export const PollMapper = {
  toPersistence(poll: Poll): PollRecord {
    return {
      id: poll.id.toString(),
      question: poll.question.value,
      createdAt: poll.createdAt.toISOString(),
      options: poll.options.map((option) => ({
        id: option.id.toString(),
        label: option.label,
        votes: option.votes,
      })),
    };
  },

  toDomain(record: PollRecord): Poll {
    const pollOrError = Poll.reconstitute(
      {
        question: record.question,
        createdAt: new Date(record.createdAt),
        options: record.options,
      },
      record.id,
    );

    if (pollOrError.isFailure) {
      throw new Error(`Corrupt poll record ${record.id}: ${pollOrError.getErrorValue()}`);
    }

    return pollOrError.getValue();
  },
};
