"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

export function SettingsGmail() {
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/settings/gmail");
      if (!response.ok) throw new Error("Failed to get auth URL");
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect Gmail",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        Gmail Integration
      </Label>
      <Button
        onClick={() => connectMutation.mutate()}
        disabled={connectMutation.isPending}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {connectMutation.isPending ? "Connecting..." : "Connect Gmail"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Connect your Gmail account to automatically process email attachments as documents.
      </p>
    </div>
  );
}