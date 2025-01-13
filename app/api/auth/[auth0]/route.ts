import { NextApiRequest, NextApiResponse } from 'next';
import { handleAuth, handleCallback, Session } from '@auth0/nextjs-auth0';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = handleAuth({
  callback: handleCallback({
    async afterCallback(req: NextApiRequest, res: NextApiResponse, session: Session) {
      if (session?.user) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, session.user.email),
        });

        if (existingUser) {
          if (existingUser.isInvited && !existingUser.auth0Id) {
            // Convert invited user to regular user
            await db
              .update(users)
              .set({
                auth0Id: session.user.sub,
                name: session.user.name,
                isInvited: false,
              })
              .where(eq(users.id, existingUser.id));
          }
        } else {
          // Create new user if not found
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