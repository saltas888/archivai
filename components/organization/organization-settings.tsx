"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { Pencil } from "lucide-react";
import useCurrentUser from "./useCurrentUser";
import { Organization } from "@/lib/db/schema";

interface OrganizationSettingsProps {
  organization: Pick<Organization, 'id' | 'name' | 'logo'>;
}

async function updateOrganization(data: { name: string; logo?: string }) {
  const response = await fetch("/api/organizations", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update organization");
  return response.json();
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(organization.name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { currentUser } = useCurrentUser();

  const isAdmin = currentUser?.role === 'admin';

  const mutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                {organization.logo ? (
                  <Image
                    src={organization.logo}
                    alt="Organization logo"
                    fill
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {organization.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-medium">{organization.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              {organization.logo ? (
                <Image
                  src={organization.logo}
                  alt="Organization logo"
                  fill
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {organization.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <UploadButton
              endpoint="organizationLogo"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  mutation.mutate({ name, logo: res[0].url });
                }
              }}
              onUploadError={(error: Error) => {
                toast({
                  title: "Upload failed",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
          </div>

          <div className="space-y-2">
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate({ name });
                }}
                className="flex gap-2"
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" disabled={mutation.isPending}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setName(organization.name);
                  }}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{organization.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}