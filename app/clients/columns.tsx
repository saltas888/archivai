"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/db/schema";
import { format } from "date-fns";

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Name",
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