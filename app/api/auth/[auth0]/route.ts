import { NextApiRequest } from 'next';
import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';


export const GET = handleAuth({
  callback: handleCallback({
    async afterCallback(req: NextApiRequest, session) {
      if (session?.user) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.auth0Id, session.user.sub),
        });

        if (!existingUser) {
          await db.insert(users).values({
            auth0Id: session.user.sub,
            email: session.user.email,
            name: session.user.name,
          });
        }
      }
      return session;
    },
  }),
});