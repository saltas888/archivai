"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CreateOrganization } from "@/components/organization/create-organization";
import { MembersList } from "@/components/organization/members-list";
import { AddMember } from "@/components/organization/add-member";

async function getOrganization() {
  const response = await fetch("/api/organizations");
  if (!response.ok) throw new Error("Failed to fetch organization");
  return response.json();
}

export default function OrganizationPage() {
  const { toast } = useToast();
  const { data: organization, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <CreateOrganization />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{organization.name}</p>
        </CardContent>
      </Card>

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