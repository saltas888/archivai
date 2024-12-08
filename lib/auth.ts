import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRole() {
  const session = await getSession();
  if (!session?.user) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.auth0Id, session.user.sub),
  });

  return user?.role || null;
}

export async function checkIsAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}