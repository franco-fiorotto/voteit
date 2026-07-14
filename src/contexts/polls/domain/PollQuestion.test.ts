import { PollQuestion } from './PollQuestion';

describe('PollQuestion', () => {
  it('creates from a valid string and trims it', () => {
    const result = PollQuestion.create('  What is your favourite colour?  ');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('What is your favourite colour?');
  });

  it('rejects an empty question', () => {
    expect(PollQuestion.create('   ').isFailure).toBe(true);
  });

  it('rejects a question longer than MAX_LENGTH', () => {
    const tooLong = 'a'.repeat(PollQuestion.MAX_LENGTH + 1);
    expect(PollQuestion.create(tooLong).isFailure).toBe(true);
  });

  it('compares by value', () => {
    const a = PollQuestion.create('Same?').getValue();
    const b = PollQuestion.create('Same?').getValue();
    expect(a.equals(b)).toBe(true);
  });
});
