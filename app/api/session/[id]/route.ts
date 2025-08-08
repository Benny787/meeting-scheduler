import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }   //   params is a Promise
) {
  const { id } = await params;                       //  await it

  try {
    const session = await prisma.meetingSession.findUnique({
      where: { id },
      include: {
        users: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (e) {
    console.error('[SESSION FETCH ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
