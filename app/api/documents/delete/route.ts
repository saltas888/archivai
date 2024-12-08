import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { docs } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();
    
    await db.delete(docs).where(inArray(docs.id, ids));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    );
  }
}