import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const members = await db.query.users.findMany({
      where: eq(users.organizationId, currentUser.organizationId),
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!currentUser?.organizationId || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized or no organization" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const member = await db
      .update(users)
      .set({
        organizationId: currentUser.organizationId,
        role: body.role || 'member',
      })
      .where(eq(users.email, body.email))
      .returning();

    return NextResponse.json(member[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}