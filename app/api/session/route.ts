import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST() {
  const id = nanoid(6);

  await prisma.session.create({
    data: {
      id,
      data: {}, // start empty
    },
  });

  console.log('[SESSION CREATED]', id);
  return NextResponse.json({ id });
}
