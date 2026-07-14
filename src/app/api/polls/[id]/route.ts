import { NextRequest, NextResponse } from 'next/server';
import { GetPollFactory } from '@/contexts/polls/application/getPoll/GetPollFactory';

export const dynamic = 'force-dynamic';

/** GET /api/polls/[id] — fetch a single poll, 404 if it does not exist. */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const result = await GetPollFactory.create().execute({ pollId: id });

  if (result.isLeft()) {
    return NextResponse.json({ error: result.value.getErrorValue() }, { status: 500 });
  }

  const { found, poll } = result.value.getValue();
  if (!found || !poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
  }

  return NextResponse.json(poll);
}
