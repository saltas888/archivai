"use server";

import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
      with: {
        settings: true,
      },
    });

    return NextResponse.json(user?.settings || {});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    // First try to find existing settings
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id)
    });

    let settings;
    if (existingSettings) {
      // Update if exists
      settings = await db
        .update(userSettings)
        .set(body)
        .where(eq(userSettings.userId, user.id))
        .returning();
    } else {
      // Insert if doesn't exist
      settings = await db
        .insert(userSettings)
        .values({
          userId: user.id,
          ...body,
        })
        .returning();
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}