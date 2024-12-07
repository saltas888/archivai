"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

export function AuthNav() {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/api/auth/login">Sign In</a>
      </Button>
    );
  }

  return <UserNav />;
}