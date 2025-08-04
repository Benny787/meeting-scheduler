import { NextResponse } from 'next/server';
import { generateSessionId, createSession } from '@/lib/sessionStore';

export async function POST() {
  const sessionId = generateSessionId();
  createSession(sessionId);
  return NextResponse.json({ sessionId });
}
