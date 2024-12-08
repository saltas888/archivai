import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { docs } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = parseInt(params.id);

    // Remove undefined values to avoid overwriting with null
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
    
    if (body.date) body.date = new Date(body.date);

    const [document] = await db
      .update(docs)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(docs.id, id))
      .returning();

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}