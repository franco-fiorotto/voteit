/**
 * Either<L, R> is the use-case boundary type: `left` is the failure channel
 * (typed error union), `right` is the success channel. Use cases return an
 * Either so callers pattern-match instead of catching exceptions.
 */
export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }
}

export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

export const left = <L, R>(l: L): Either<L, R> => new Left<L, R>(l);

export const right = <L, R>(r: R): Either<L, R> => new Right<L, R>(r);
