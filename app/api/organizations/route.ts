import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const organization = await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          name: body.name,
          logo: body.logo,
        })
        .returning();

      await tx
        .update(users)
        .set({
          organizationId: org.id,
          role: 'admin',
        })
        .where(eq(users.auth0Id, session.user.sub));

      return org;
    });

    return NextResponse.json(organization);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organization" },
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

    if (!user?.organizationId || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const [organization] = await db
      .update(organizations)
      .set({
        name: body.name,
        logo: body.logo,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, user.organizationId))
      .returning();

    return NextResponse.json(organization);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(null);
    }

    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, user.organizationId),
    });

    return NextResponse.json(organization);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}