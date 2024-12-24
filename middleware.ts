import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // First, handle internationalization
  const handleI18nRouting = createIntlMiddleware({
    locales: ['en', 'el'],
    defaultLocale: 'en'
  });

  // Then, wrap with authentication
  const authMiddleware = withMiddlewareAuthRequired({
    returnTo: "/login"
  });

  // Combine the middlewares
  const i18nResponse = handleI18nRouting(request);
  const authResponse = await authMiddleware(request, event);

  // Merge responses if both exist
  return authResponse || i18nResponse || NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|api/uploadthing).*)',
  ],
};