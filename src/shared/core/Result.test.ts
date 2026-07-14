import { Result } from './Result';
import { left, right } from './Either';

describe('Result', () => {
  it('holds a value on success', () => {
    const result = Result.ok<number>(42);
    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.getValue()).toBe(42);
  });

  it('holds an error message on failure', () => {
    const result = Result.fail<number>('boom');
    expect(result.isFailure).toBe(true);
    expect(result.isSuccess).toBe(false);
    expect(result.getErrorValue()).toBe('boom');
  });

  it('throws when reading the value of a failed result', () => {
    const result = Result.fail<number>('boom');
    expect(() => result.getValue()).toThrow();
  });

  it('combine returns the first failure', () => {
    const combined = Result.combine([Result.ok(), Result.fail('bad'), Result.ok()]);
    expect(combined.isFailure).toBe(true);
    expect(combined.getErrorValue()).toBe('bad');
  });

  it('combine succeeds when all results succeed', () => {
    const combined = Result.combine([Result.ok(), Result.ok()]);
    expect(combined.isSuccess).toBe(true);
  });
});

describe('Either', () => {
  it('right is the success channel', () => {
    const e = right<string, number>(10);
    expect(e.isRight()).toBe(true);
    expect(e.isLeft()).toBe(false);
    if (e.isRight()) expect(e.value).toBe(10);
  });

  it('left is the failure channel', () => {
    const e = left<string, number>('nope');
    expect(e.isLeft()).toBe(true);
    expect(e.isRight()).toBe(false);
    if (e.isLeft()) expect(e.value).toBe('nope');
  });
});
