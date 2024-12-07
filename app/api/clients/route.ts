import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const clientsList = await db.query.clients.findMany({
      where: eq(clients.organizationId, user.organizationId),
    });

    return NextResponse.json(clientsList);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
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

    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await req.json();
    const client = await db
      .insert(clients)
      .values({
        ...body,
        organizationId: user.organizationId,
      })
      .returning();

    return NextResponse.json(client[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}