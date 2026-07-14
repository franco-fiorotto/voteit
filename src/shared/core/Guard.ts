import { Result } from './Result';

export interface GuardArgument {
  argument: unknown;
  argumentName: string;
}

/**
 * Small input-validation helper used by value objects and controllers to guard
 * against null/undefined and length violations before building domain objects.
 */
export class Guard {
  public static againstNullOrUndefined(argument: unknown, argumentName: string): Result<void> {
    if (argument === null || argument === undefined) {
      return Result.fail<void>(`${argumentName} is null or undefined`);
    }
    return Result.ok<void>();
  }

  public static againstNullOrUndefinedBulk(args: GuardArgument[]): Result<void> {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }
    return Result.ok<void>();
  }

  public static againstEmptyString(argument: string, argumentName: string): Result<void> {
    if (typeof argument !== 'string' || argument.trim().length === 0) {
      return Result.fail<void>(`${argumentName} must be a non-empty string`);
    }
    return Result.ok<void>();
  }

  public static inRange(
    num: number,
    min: number,
    max: number,
    argumentName: string,
  ): Result<void> {
    if (num < min || num > max) {
      return Result.fail<void>(`${argumentName} must be between ${min} and ${max}`);
    }
    return Result.ok<void>();
  }
}
