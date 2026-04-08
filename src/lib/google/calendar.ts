import { db } from "@/lib/db";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findFirst({
    where: { platform: "google-calendar", connected: true },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error("Google Calendar not connected.");
  return account.accessToken;
}

export async function createCalendarEvent({
  title,
  startTime,
  endTime,
  description,
  attendeeEmail,
}: {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  attendeeEmail?: string;
}) {
  const token = await getAccessToken();
  const res = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events?sendUpdates=all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: title,
      description,
      start: { dateTime: startTime.toISOString(), timeZone: "America/Los_Angeles" },
      end: { dateTime: endTime.toISOString(), timeZone: "America/Los_Angeles" },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
    }),
  });
  if (!res.ok) throw new Error(`Google Calendar API error (${res.status})`);
  return res.json() as Promise<{ id: string; htmlLink: string }>;
}

export async function listUpcomingEvents(maxResults = 10) {
  const token = await getAccessToken();
  const timeMin = new Date().toISOString();
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events?maxResults=${maxResults}&timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Google Calendar API error (${res.status})`);
  return res.json() as Promise<{ items: { id: string; summary: string; start: { dateTime: string }; htmlLink: string }[] }>;
}
