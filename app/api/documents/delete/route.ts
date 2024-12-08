import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { docs } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    // First, get the documents to be deleted so we can get their file URLs
    const documentsToDelete = await db.select({
      fileUrl: docs.fileUrl,
    }).from(docs).where(inArray(docs.id, ids));

    // Delete the documents from the database
    await db.delete(docs).where(inArray(docs.id, ids));

    // Delete the files from UploadThing
    for (const doc of documentsToDelete) {
      if (doc.fileUrl) {
        try {
          // Extract the file key from the URL
          const fileKey = doc.fileUrl.split('/').pop();
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
          }
        } catch (error) {
          console.error("Failed to delete file from UploadThing:", error);
          // Continue with other deletions even if one fails
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting documents:", error);
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    );
  }
}