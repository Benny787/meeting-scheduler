import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCalendarEvents() {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.warn('[Calendar Fetch] No session found.');
    return [];
  }

  if (!session.accessToken) {
    console.warn('[Calendar Fetch] Session found but no access token. User may need to re-auth.');
    return [];
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

    return events.data.items || [];
  } catch (error) {
    console.error('[Calendar Fetch Error]', error);
    return [];
  }
}
