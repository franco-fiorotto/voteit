import { ValueObject } from '@/shared/domain/ValueObject';
import { Result } from '@/shared/core/Result';
import { Guard } from '@/shared/core/Guard';

interface PollQuestionProps {
  value: string;
}

/**
 * The prompt a poll asks. Value object: non-empty, trimmed, bounded length.
 */
export class PollQuestion extends ValueObject<PollQuestionProps> {
  public static readonly MAX_LENGTH = 280;

  private constructor(props: PollQuestionProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(value: string): Result<PollQuestion> {
    const guard = Guard.againstEmptyString(value ?? '', 'question');
    if (guard.isFailure) return Result.fail<PollQuestion>(guard.getErrorValue());

    const trimmed = value.trim();
    if (trimmed.length > PollQuestion.MAX_LENGTH) {
      return Result.fail<PollQuestion>(
        `question must be at most ${PollQuestion.MAX_LENGTH} characters`,
      );
    }

    return Result.ok<PollQuestion>(new PollQuestion({ value: trimmed }));
  }
}
