"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOrganization } from "@/components/organization/create-organization";
import { MembersList } from "@/components/organization/members-list";
import { AddMember } from "@/components/organization/add-member";
import { OrganizationSettings } from "@/components/organization/organization-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getOrganization() {
  const response = await fetch("/api/organizations");
  if (!response.ok) throw new Error("Failed to fetch organization");
  return response.json();
}

export default function OrganizationPage() {
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive"> 
        <AlertTitle>Oops</AlertTitle>
        <AlertDescription className="mt-2">
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!organization) {
    return <CreateOrganization />;
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Settings</h1>
      
      <OrganizationSettings organization={organization} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <AddMember />
        </CardHeader>
        <CardContent>
          <MembersList />
        </CardContent>
      </Card>
    </div>
  );
}