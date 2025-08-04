import fs from 'fs';
import path from 'path';

type Session = {
  id: string;
  createdAt: number;
};

const sessionsFile = path.join(process.cwd(), 'data', 'sessions.json');

// Ensure sessions file exists
if (!fs.existsSync(path.dirname(sessionsFile))) {
  fs.mkdirSync(path.dirname(sessionsFile), { recursive: true });
}
if (!fs.existsSync(sessionsFile)) {
  fs.writeFileSync(sessionsFile, JSON.stringify({}));
}

function readSessions(): Record<string, Session> {
  const data = fs.readFileSync(sessionsFile, 'utf-8');
  return JSON.parse(data);
}

function writeSessions(sessions: Record<string, Session>) {
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function createSession(id: string): Session {
  const sessions = readSessions();
  const session: Session = { id, createdAt: Date.now() };
  sessions[id] = session;
  writeSessions(sessions);
  console.log(`[SESSION CREATED] ${id}`);
  return session;
}

export function getSession(id: string): Session | undefined {
  const sessions = readSessions();
  const session = sessions[id];
  console.log(`[GET SESSION] ${id} FOUND: ${!!session}`);
  return session;
}
