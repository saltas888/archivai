import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";
import auth0ManagementClient from "@/lib/auth0mgmt";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });

    if (!currentUser?.organizationId || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized or no organization" },
        { status: 401 }
      );
    }

    // Get user to delete
    const userToDelete = await db.query.users.findFirst({
      where: eq(users.id, params.id),
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure user belongs to same organization
    if (userToDelete.organizationId !== currentUser.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // delete user from Auth0
    try {
        await auth0ManagementClient.deleteUserByEmail(userToDelete.email);
    } catch (error) {
        console.error("Failed to delete user from Auth0:", error);
    }

    // Delete user from database
    await db.delete(users).where(eq(users.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}