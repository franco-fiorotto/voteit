'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreatePollForm } from '@/app/components/CreatePollForm';
import { pollsClient, type PollDTO } from '@/app/lib/pollsClient';

export default function HomePage() {
  const [polls, setPolls] = useState<PollDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    pollsClient
      .list()
      .then((data) => active && setPolls(data))
      .catch((err) =>
        active && setError(err instanceof Error ? err.message : 'Failed to load polls'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">🗳️ VoteIt</h1>
        <p className="text-sm text-muted-foreground">
          Create a poll, share the link, and watch the results roll in.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New poll</CardTitle>
          <CardDescription>Add a question and at least two options.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePollForm onCreated={(poll) => setPolls((prev) => [poll, ...prev])} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">All polls</h2>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && polls.length === 0 && (
          <p className="text-sm text-muted-foreground">No polls yet — create the first one above.</p>
        )}

        {polls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
                <CardDescription>
                  {poll.options.length} options · {poll.totalVotes}{' '}
                  {poll.totalVotes === 1 ? 'vote' : 'votes'}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
