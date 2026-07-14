/**
 * Identity for entities. Generates a UUID when none is provided; accepts an
 * existing id when rehydrating from persistence. Uses the Web Crypto API
 * (`globalThis.crypto`), available in Node 20+ and browsers, to avoid bundling
 * Node's `crypto` module into any client boundary.
 */
export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? globalThis.crypto.randomUUID();
  }

  public toString(): string {
    return this.value;
  }

  public equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) return false;
    return this.value === id.toString();
  }
}
