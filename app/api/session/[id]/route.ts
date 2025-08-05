import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.meetingSession.findUnique({
      where: { id: params.id },
      include: {
        users: {
          include: {
            user: true, // pulls name, image, email, etc.
          },
        },
      },
    });

    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(session);
  } catch (e) {
    console.error('[SESSION FETCH ERROR]', e);
    return new NextResponse(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
}
