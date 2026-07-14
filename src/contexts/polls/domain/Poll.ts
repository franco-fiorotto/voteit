import { AggregateRoot } from '@/shared/domain/AggregateRoot';
import { UniqueEntityID } from '@/shared/domain/UniqueEntityID';
import { Result } from '@/shared/core/Result';
import { PollQuestion } from './PollQuestion';
import { PollOption } from './PollOption';

interface PollProps {
  question: PollQuestion;
  options: PollOption[];
  createdAt: Date;
}

/** Loose shape accepted when creating a brand-new poll. */
export interface CreatePollProps {
  question: string;
  options: string[];
  createdAt?: Date;
}

/** Fully-specified shape used to rehydrate a poll from persistence. */
export interface ReconstitutePollProps {
  question: string;
  options: { id: string; label: string; votes: number }[];
  createdAt: Date;
}

/** Transport shape returned to callers (includes derived percentages). */
export interface PollOptionDTO {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface PollDTO {
  id: string;
  question: string;
  options: PollOptionDTO[];
  totalVotes: number;
  createdAt: string;
}

/**
 * Poll aggregate root. Owns its options and enforces the poll's invariants:
 * a valid question and between MIN_OPTIONS and MAX_OPTIONS choices. Voting only
 * happens through `castVote`, which keeps option totals consistent.
 */
export class Poll extends AggregateRoot<PollProps> {
  public static readonly MIN_OPTIONS = 2;
  public static readonly MAX_OPTIONS = 10;

  private constructor(props: PollProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public get question(): PollQuestion {
    return this.props.question;
  }

  public get options(): PollOption[] {
    return this.props.options;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get totalVotes(): number {
    return this.props.options.reduce((sum, option) => sum + option.votes, 0);
  }

  /**
   * Records a vote for the given option id. Returns a failing Result if the
   * option does not belong to this poll — the caller decides how to surface it.
   */
  public castVote(optionId: string): Result<void> {
    const option = this.props.options.find((o) => o.id.toString() === optionId);
    if (!option) {
      return Result.fail<void>(`option "${optionId}" does not belong to this poll`);
    }
    option.registerVote();
    return Result.ok<void>();
  }

  public toDTO(): PollDTO {
    const totalVotes = this.totalVotes;
    return {
      id: this._id.toString(),
      question: this.props.question.value,
      totalVotes,
      createdAt: this.props.createdAt.toISOString(),
      options: this.props.options.map((option) => ({
        id: option.id.toString(),
        label: option.label,
        votes: option.votes,
        percentage: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100),
      })),
    };
  }

  private static validateOptionCount(count: number): Result<void> {
    if (count < Poll.MIN_OPTIONS) {
      return Result.fail<void>(`a poll needs at least ${Poll.MIN_OPTIONS} options`);
    }
    if (count > Poll.MAX_OPTIONS) {
      return Result.fail<void>(`a poll can have at most ${Poll.MAX_OPTIONS} options`);
    }
    return Result.ok<void>();
  }

  public static create(props: CreatePollProps, id?: UniqueEntityID): Result<Poll> {
    const questionOrError = PollQuestion.create(props.question);
    if (questionOrError.isFailure) return Result.fail<Poll>(questionOrError.getErrorValue());

    const rawOptions = props.options ?? [];
    const countGuard = Poll.validateOptionCount(rawOptions.length);
    if (countGuard.isFailure) return Result.fail<Poll>(countGuard.getErrorValue());

    const options: PollOption[] = [];
    for (const label of rawOptions) {
      const optionOrError = PollOption.create({ label });
      if (optionOrError.isFailure) return Result.fail<Poll>(optionOrError.getErrorValue());
      options.push(optionOrError.getValue());
    }

    return Result.ok<Poll>(
      new Poll({ question: questionOrError.getValue(), options, createdAt: props.createdAt ?? new Date() }, id),
    );
  }

  /**
   * Rebuilds a poll from trusted persisted data (option ids and vote counts are
   * preserved). Still runs validation so corrupt records surface as failures.
   */
  public static reconstitute(props: ReconstitutePollProps, id: string): Result<Poll> {
    const questionOrError = PollQuestion.create(props.question);
    if (questionOrError.isFailure) return Result.fail<Poll>(questionOrError.getErrorValue());

    const countGuard = Poll.validateOptionCount(props.options.length);
    if (countGuard.isFailure) return Result.fail<Poll>(countGuard.getErrorValue());

    const options: PollOption[] = [];
    for (const record of props.options) {
      const optionOrError = PollOption.create(
        { label: record.label, votes: record.votes },
        new UniqueEntityID(record.id),
      );
      if (optionOrError.isFailure) return Result.fail<Poll>(optionOrError.getErrorValue());
      options.push(optionOrError.getValue());
    }

    return Result.ok<Poll>(
      new Poll(
        { question: questionOrError.getValue(), options, createdAt: props.createdAt },
        new UniqueEntityID(id),
      ),
    );
  }
}
