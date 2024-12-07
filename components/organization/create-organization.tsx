"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

async function createOrganization(name: string) {
  const response = await fetch("/api/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to create organization");
  return response.json();
}

export function CreateOrganization() {
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(name);
          }}
          className="space-y-4"
        >
          <Input
            placeholder="Organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}