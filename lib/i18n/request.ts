import {getRequestConfig} from 'next-intl/server';
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default getRequestConfig(async ({requestLocale}) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.auth0Id, session.user.sub),
    with: {
      settings: true,
    },
  });

  let requestedLocale = await requestLocale;

  const locale = user?.settings?.language || requestedLocale || 'en';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});