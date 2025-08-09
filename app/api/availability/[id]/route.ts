import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/availability/:id?from=ISO&to=ISO
 * Aggregates all users' busy ranges for the window into 30-min slots.
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(req.url);
    const fromISO = searchParams.get('from');
    const toISO = searchParams.get('to');
    if (!fromISO || !toISO) {
      return NextResponse.json({ error: 'Missing from/to' }, { status: 400 });
    }
    const from = new Date(fromISO);
    const to = new Date(toISO);

    // Fetch exactly the cached windows for this session
    const all = await prisma.meetingAvailability.findMany({
      where: { sessionId, from, to },
      select: { busy: true, userId: true },
    });

    // Count total participants in the session (joins)
    const participants = await prisma.sessionUser.count({
      where: { sessionId },
    });

    // Build 30-min slots for the 7-day, 8:00–20:00 window
    const slots: { start: string; end: string; count: number }[] = [];
    const base = new Date(from);
    base.setHours(8, 0, 0, 0);

    for (let d = 0; d < 7; d++) {
      for (let i = 0; i < 24; i++) {
        const slotStart = new Date(base);
        slotStart.setDate(base.getDate() + d);
        slotStart.setMinutes(slotStart.getMinutes() + i * 30);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        let count = 0;
        for (const r of all) {
          const busyArr = (r.busy as { start: string; end: string }[]) || [];
          if (
            busyArr.some(
              (b) =>
                slotStart.getTime() < new Date(b.end).getTime() &&
                new Date(b.start).getTime() < slotEnd.getTime()
            )
          ) {
            count++;
          }
        }

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          count,
        });
      }
    }

    return NextResponse.json({ slots, participants });
  } catch (e) {
    console.error('[AVAILABILITY_GET_ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/availability/:id
 * Body: { from: ISO, to: ISO, busy: {start,end}[] }
 * Upserts the caller's busy ranges for this window.
 */
export async function POST(req: Request, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const { from, to, busy } = await req.json();

    if (!from || !to || !Array.isArray(busy)) {
      return NextResponse.json({ error: 'Missing or invalid body' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await prisma.meetingAvailability.upsert({
      where: {
        sessionId_userId_from_to: {
          sessionId,
          userId,
          from: new Date(from),
          to: new Date(to),
        },
      },
      create: {
        sessionId,
        userId,
        from: new Date(from),
        to: new Date(to),
        busy,
      },
      update: {
        busy,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[AVAILABILITY_POST_ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
