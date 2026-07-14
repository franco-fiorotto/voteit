import { Poll } from './Poll';

/**
 * Driven port for poll persistence. The application layer depends only on this
 * interface; concrete implementations (in-memory now, a real DB later) live in
 * `infra/` and are injected via the constructor.
 */
export interface IPollRepo {
  save(poll: Poll): Promise<void>;
  getById(id: string): Promise<Poll | null>;
  getAll(): Promise<Poll[]>;
}
