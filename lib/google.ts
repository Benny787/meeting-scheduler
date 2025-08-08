import { google } from "googleapis";

export function getOAuthClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function fetchFreeBusy(accessToken: string, timeMin: string, timeMax: string) {
  const auth = getOAuthClient(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: "primary" }],
    },
  });

  const cal = res.data.calendars?.primary;
  const busy = cal?.busy ?? [];
  return busy; // [{ start, end }, ...]
}
