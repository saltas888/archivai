"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RECORD_TYPE_VALUES } from "@/lib/db/schema";
import { useSearchParams } from "next/navigation";

interface DocumentFiltersProps {
  onFilterChange: (key: string, value: string | null) => void;
}

export function DocumentFilters({ onFilterChange }: DocumentFiltersProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex gap-4">
      <div className="w-[200px]">
        <Select
          value={searchParams.get("recordType") || ""}
          onValueChange={(value) => onFilterChange("recordType", value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {RECORD_TYPE_VALUES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        placeholder="Search provider..."
        className="w-[200px]"
        value={searchParams.get("provider") || ""}
        onChange={(e) => onFilterChange("provider", e.target.value || null)}
      />

      <Input
        placeholder="Search record number..."
        className="w-[200px]"
        value={searchParams.get("recordNumber") || ""}
        onChange={(e) => onFilterChange("recordNumber", e.target.value || null)}
      />
    </div>
  );
}