import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUrl } from "@/lib/gmail";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUrl = getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get Gmail auth URL" },
      { status: 500 }
    );
  }
}