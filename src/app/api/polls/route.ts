import { NextRequest, NextResponse } from 'next/server';
import { ListPollsFactory } from '@/contexts/polls/application/listPolls/ListPollsFactory';
import { CreatePollFactory } from '@/contexts/polls/application/createPoll/CreatePollFactory';
import { CreatePollErrors } from '@/contexts/polls/application/createPoll/CreatePollErrors';

// The poll store lives in process memory, so responses must never be cached.
export const dynamic = 'force-dynamic';

/** GET /api/polls — list every poll, newest first. */
export async function GET() {
  const result = await ListPollsFactory.create().execute();

  if (result.isLeft()) {
    return NextResponse.json({ error: result.value.getErrorValue() }, { status: 500 });
  }

  return NextResponse.json(result.value.getValue());
}

/** POST /api/polls — create a poll from { question, options }. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const { question, options } = (body ?? {}) as { question?: unknown; options?: unknown };
  if (typeof question !== 'string' || !Array.isArray(options)) {
    return NextResponse.json(
      { error: 'question (string) and options (string[]) are required' },
      { status: 400 },
    );
  }

  const result = await CreatePollFactory.create().execute({
    question,
    options: options.map(String),
  });

  if (result.isLeft()) {
    const status = result.value instanceof CreatePollErrors.InvalidPoll ? 400 : 500;
    return NextResponse.json({ error: result.value.getErrorValue() }, { status });
  }

  return NextResponse.json(result.value.getValue(), { status: 201 });
}
