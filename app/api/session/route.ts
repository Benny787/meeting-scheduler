import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST() {
  try {
    const id = nanoid(6);

    const session = await prisma.meetingSession.create({
      data: {
        id,
        data: {},
      },
    });

    console.log('[SESSION CREATED]', session.id);

    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error('[SESSION CREATE ERROR]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
