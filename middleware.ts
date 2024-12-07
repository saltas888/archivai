import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired({
  returnTo: "/login",
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|api/uploadthing).*)',
  ],
};