import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTokens, watchGmail } from "@/lib/gmail";
import { OAuth2Client } from "google-auth-library";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const tokens = await getTokens(code);

    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


      // First try to find existing settings
      const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id)
      });
  
      if (existingSettings) {
      // Update if exists
      await db
          .update(userSettings)
          .set({
            gmailAccessToken: tokens.access_token,
            gmailRefreshToken: tokens.refresh_token,
          })
          .where(eq(userSettings.userId, user.id))
          .returning();
      } else {
      // Insert if doesn't exist
      await db
          .insert(userSettings)
          .values({
            userId: user.id,
            gmailAccessToken: tokens.access_token,
            gmailRefreshToken: tokens.refresh_token,
          })
          .returning();
      }

    // Set up Gmail watch
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials(tokens);
    await watchGmail(oauth2Client);

    return NextResponse.redirect(new URL("/settings", request.url));
  } catch (error) {
    console.error("Gmail callback error:", error);
    return NextResponse.json(
      { error: "Failed to process Gmail callback" },
      { status: 500 }
    );
  }
}