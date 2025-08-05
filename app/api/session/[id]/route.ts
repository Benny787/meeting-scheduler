import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
  });

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Session not found' }), {
      status: 404,
    });
  }

  return NextResponse.json(session);
}
