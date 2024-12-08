"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Image from "next/image";

async function getOrganization() {
  const response = await fetch("/api/organizations");
  if (!response.ok) throw new Error("Failed to fetch organization");
  return response.json();
}

export function UserNav() {
  const { user } = useUser();
  const { data: organization } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-gray-200">
          {organization?.logo ? (
            <Image
              src={organization.logo}
              alt={organization.name}
              fill
              className="rounded-full object-cover"
            />
          ) : user.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "User avatar"}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {organization && (
              <p className="text-xs text-muted-foreground">
                {organization.name}
              </p>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/api/auth/logout" className="text-red-600 hover:text-red-700">
            Log out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}