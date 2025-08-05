import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  console.log('[DEBUG] Session:', session);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Not authenticated or token missing' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(events.data.items || []);
  } catch (error) {
    console.error('[CALENDAR ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
