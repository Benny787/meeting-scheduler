import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { fetchFreeBusy } from "@/lib/google";

// POST /api/calendar  { from: string, to: string } (ISO)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { from, to } = await req.json().catch(() => ({}));
  const timeMin = from ?? new Date().toISOString();
  const timeMax =
    to ??
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // default 7 days

  try {
    const busy = await fetchFreeBusy((session as any).accessToken, timeMin, timeMax);
    return NextResponse.json({ busy });
  } catch (error) {
    console.error("[CALENDAR ERROR]", error);
    // If we ever wanted to detect token error, we could surface (session as any).tokenError here.
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
