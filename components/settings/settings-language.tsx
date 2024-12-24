"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { languages } from "@/lib/i18n/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsLanguageProps {
  initialValue?: string;
}

export function SettingsLanguage({ initialValue = "en" }: SettingsLanguageProps) {
    const t = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (language: string) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!response.ok) throw new Error("Failed to update language");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Success",
        description: "Language preference updated",
      });
      // Reload the page to apply the new language
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update language",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="language" className="flex items-center gap-2">
        {t('settings.language')}
        {mutation.isPending && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </Label>
      <Select
        value={initialValue}
        onValueChange={(value) => mutation.mutate(value)}
        disabled={mutation.isPending}
      >
        <SelectTrigger 
          id="language" 
          className={cn(
            "w-[180px]",
            mutation.isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}