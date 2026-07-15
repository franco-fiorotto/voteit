'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PollResults } from '@/app/components/PollResults';
import { pollsClient, type PollDTO } from '@/app/lib/pollsClient';

export default function PollPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [poll, setPoll] = useState<PollDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const votingRef = useRef(false);

  useEffect(() => {
    pollsClient
      .get(id)
      .then(setPoll)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load poll'))
      .finally(() => setLoading(false));

    // Poll for fresh counts so other voters' votes show up without a reload.
    const interval = setInterval(() => {
      if (votingRef.current || document.hidden) return;
      pollsClient
        .get(id)
        .then(setPoll)
        .catch(() => {
          // Ignore transient refresh failures; keep showing the last known state.
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const vote = async (optionId: string) => {
    setVoting(true);
    votingRef.current = true;
    setError(null);
    try {
      const updated = await pollsClient.vote(id, optionId);
      setPoll(updated);
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record vote');
    } finally {
      setVoting(false);
      votingRef.current = false;
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← All polls
      </Link>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {poll && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{poll.question}</CardTitle>
            <CardDescription>
              {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'} so far
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {!hasVoted ? (
              <div className="flex flex-col gap-2">
                {poll.options.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="lg"
                    className="justify-start"
                    disabled={voting}
                    onClick={() => vote(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            ) : (
              <>
                <PollResults poll={poll} />
                <Button variant="ghost" size="sm" onClick={() => setHasVoted(false)}>
                  Vote again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
