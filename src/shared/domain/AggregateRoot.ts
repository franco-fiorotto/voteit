import { Entity } from './Entity';

/**
 * An AggregateRoot is the entry point to a cluster of domain objects treated as
 * a single unit. This trimmed version omits the domain-event machinery (out of
 * scope for this app) but keeps the type distinction so the model reads with the
 * same intent as the reference architecture.
 */
export abstract class AggregateRoot<T> extends Entity<T> {}
