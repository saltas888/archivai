import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";
import auth0ManagementClient from "@/lib/auth0mgmt";

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

    // User exists in Auth0, check if they're in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (existingUser && !existingUser.isInvited) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    
    const { invitationUrl } = await auth0ManagementClient.inviteUser(body.email, currentUser.name as string, ['member']);

    // Create or update invited user in our database
    const member = await db
      .insert(users)
      .values({
        email: body.email,
        organizationId: currentUser.organizationId,
        role: body.role || 'member',
        isInvited: true,
        invitedBy: currentUser.id,
        invitedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      ...member[0],
      invitationUrl,
    });
  } catch (error) {
    console.error("Failed to add member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}