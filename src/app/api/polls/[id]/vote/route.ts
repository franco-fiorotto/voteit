import { NextRequest, NextResponse } from 'next/server';
import { CastVoteFactory } from '@/contexts/polls/application/castVote/CastVoteFactory';
import { CastVoteErrors } from '@/contexts/polls/application/castVote/CastVoteErrors';

export const dynamic = 'force-dynamic';

/** POST /api/polls/[id]/vote — record a vote for { optionId }. */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const { optionId } = (body ?? {}) as { optionId?: unknown };
  if (typeof optionId !== 'string') {
    return NextResponse.json({ error: 'optionId (string) is required' }, { status: 400 });
  }

  const result = await CastVoteFactory.create().execute({ pollId: id, optionId });

  if (result.isLeft()) {
    let status = 500;
    if (result.value instanceof CastVoteErrors.PollNotFound) status = 404;
    else if (result.value instanceof CastVoteErrors.InvalidVote) status = 400;
    return NextResponse.json({ error: result.value.getErrorValue() }, { status });
  }

  return NextResponse.json(result.value.getValue());
}
