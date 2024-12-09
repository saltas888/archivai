"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/db/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const columns: ColumnDef<Client>[] = [
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        asChild
      >
        <Link href={`/clients/${row.original.id}`}>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "vat",
    header: "Vat",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PPP"),
  },
];