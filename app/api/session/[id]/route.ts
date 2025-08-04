import { getSession } from '@/lib/sessionStore';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Session not found' }), {
      status: 404,
    });
  }

  return NextResponse.json(session);
}
