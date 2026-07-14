import type { PollDTO } from '@/contexts/polls/domain/Poll';

/**
 * Thin browser-side client for the polls API. Keeps fetch/JSON/error handling
 * in one place so components stay declarative. Re-exports the PollDTO type so
 * the UI shares the exact contract the backend returns.
 */
export type { PollDTO };

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const pollsClient = {
  list(): Promise<PollDTO[]> {
    return fetch('/api/polls', { cache: 'no-store' }).then((r) => parse<PollDTO[]>(r));
  },

  get(id: string): Promise<PollDTO> {
    return fetch(`/api/polls/${id}`, { cache: 'no-store' }).then((r) => parse<PollDTO>(r));
  },

  create(question: string, options: string[]): Promise<PollDTO> {
    return fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options }),
    }).then((r) => parse<PollDTO>(r));
  },

  vote(pollId: string, optionId: string): Promise<PollDTO> {
    return fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
    }).then((r) => parse<PollDTO>(r));
  },
};
