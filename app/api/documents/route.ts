import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { docs, users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { and, eq, ilike, SQL } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordType = searchParams.get("recordType");
    const provider = searchParams.get("provider");
    const recordNumber = searchParams.get("recordNumber");

    const whereClauses: SQL<unknown>[] = [];
    

    if (recordType) {
      whereClauses.push(eq(docs.recordType, recordType as any));
    }

    if (provider) {
      whereClauses.push(ilike(docs.serviceProviderName, `%${provider}%`));
    }

    if (recordNumber) {
      whereClauses.push(ilike(docs.recordNumber, `%${recordNumber}%`));
    }
    const query = db.select().from(docs).where(and(...whereClauses));
    const documents = await query.orderBy(docs.createdAt);
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
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
    const document = await db.insert(docs).values({
      ...body,
      organizationId: user.organizationId,
      date: new Date(),
    }).returning();

    return NextResponse.json(document[0]);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}