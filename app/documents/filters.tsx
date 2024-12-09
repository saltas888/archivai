"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RECORD_TYPE_VALUES } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getClients } from "@/lib/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface DocumentFiltersProps {
  onFilterChange: (key: string, value: string | null) => void;
}

export function DocumentFilters({ onFilterChange }: DocumentFiltersProps) {
  const searchParams = useSearchParams();
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const selectedClientIds = searchParams.get("clientIds")?.split(",") || [];

  const toggleClient = (clientId: string) => {
    const newSelectedIds = selectedClientIds.includes(clientId)
      ? selectedClientIds.filter(id => id !== clientId)
      : [...selectedClientIds, clientId];
    
    onFilterChange("clientIds", newSelectedIds.length > 0 ? newSelectedIds.join(",") : null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
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

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !searchParams.get("startDate") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.get("startDate") ? (
                  format(new Date(searchParams.get("startDate")!), "PPP")
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined}
                onSelect={(date) => onFilterChange("startDate", date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !searchParams.get("endDate") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.get("endDate") ? (
                  format(new Date(searchParams.get("endDate")!), "PPP")
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined}
                onSelect={(date) => onFilterChange("endDate", date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10">
              {selectedClientIds.length > 0 ? (
                <>
                  {selectedClientIds.length} client{selectedClientIds.length === 1 ? "" : "s"} selected
                </>
              ) : (
                "Filter by client"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search clients..." />
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => toggleClient(client.id.toString())}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedClientIds.includes(client.id.toString())
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{client.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="mt-2 flex flex-wrap gap-2">
          {selectedClientIds.map((clientId) => {
            const client = clients.find((c) => c.id.toString() === clientId);
            if (!client) return null;
            return (
              <Badge
                key={clientId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleClient(clientId)}
              >
                {client.name}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleClient(clientId);
                  }}
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}