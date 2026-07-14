import { IPollRepo } from '@/contexts/polls/domain/IPollRepo';
import { Poll } from '@/contexts/polls/domain/Poll';
import { PollMapper, PollRecord } from '@/contexts/polls/infra/mappers/PollMapper';

/**
 * Process-wide store shared by every InMemoryPollRepo created without an
 * explicit store. On Vercel this survives only for the lifetime of a warm
 * serverless instance — a deliberate trade-off (see README). Because the repo
 * hides behind IPollRepo, a durable implementation drops in without touching
 * the domain or application layers.
 */
const globalStore = new Map<string, PollRecord>();

/**
 * In-memory IPollRepo. Persists serialised records (not live aggregates) so
 * reads return fresh instances and in-flight mutations never leak into the
 * store — the same contract a real database would honour.
 */
export class InMemoryPollRepo implements IPollRepo {
  private readonly store: Map<string, PollRecord>;

  constructor(store: Map<string, PollRecord> = globalStore) {
    this.store = store;
  }

  public async save(poll: Poll): Promise<void> {
    this.store.set(poll.id.toString(), PollMapper.toPersistence(poll));
  }

  public async getById(id: string): Promise<Poll | null> {
    const record = this.store.get(id);
    return record ? PollMapper.toDomain(record) : null;
  }

  public async getAll(): Promise<Poll[]> {
    return [...this.store.values()]
      .map((record) => PollMapper.toDomain(record))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /** Test helper — reset the store between cases. */
  public clear(): void {
    this.store.clear();
  }

  /** Test helper — number of stored polls. */
  public get size(): number {
    return this.store.size;
  }
}
