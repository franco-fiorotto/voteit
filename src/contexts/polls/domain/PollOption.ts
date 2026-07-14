import { Entity } from '@/shared/domain/Entity';
import { UniqueEntityID } from '@/shared/domain/UniqueEntityID';
import { Result } from '@/shared/core/Result';
import { Guard } from '@/shared/core/Guard';

interface PollOptionProps {
  label: string;
  votes: number;
}

/**
 * A single choice within a poll. An entity (it has identity and a mutable vote
 * count). Business rule lives here: `registerVote` is the only way votes grow.
 */
export class PollOption extends Entity<PollOptionProps> {
  private constructor(props: PollOptionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public get label(): string {
    return this.props.label;
  }

  public get votes(): number {
    return this.props.votes;
  }

  public registerVote(): void {
    this.props.votes += 1;
  }

  public static create(
    props: { label: string; votes?: number },
    id?: UniqueEntityID,
  ): Result<PollOption> {
    const guard = Guard.againstEmptyString(props.label ?? '', 'option label');
    if (guard.isFailure) return Result.fail<PollOption>(guard.getErrorValue());

    const votes = props.votes ?? 0;
    if (votes < 0 || !Number.isInteger(votes)) {
      return Result.fail<PollOption>('option votes must be a non-negative integer');
    }

    return Result.ok<PollOption>(new PollOption({ label: props.label.trim(), votes }, id));
  }
}
