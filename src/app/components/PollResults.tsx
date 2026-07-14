import type { PollDTO } from '@/contexts/polls/domain/Poll';

/** Renders a poll's options as horizontal bars with vote counts and percentages. */
export function PollResults({ poll }: { poll: PollDTO }) {
  const leading = Math.max(0, ...poll.options.map((o) => o.votes));

  return (
    <div className="flex flex-col gap-3">
      {poll.options.map((option) => {
        const isLeading = option.votes > 0 && option.votes === leading;
        return (
          <div key={option.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className={isLeading ? 'font-semibold' : ''}>{option.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {option.votes} {option.votes === 1 ? 'vote' : 'votes'} · {option.percentage}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  isLeading ? 'bg-primary' : 'bg-primary/50'
                }`}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
