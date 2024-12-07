"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/lib/db/schema";
import { format } from "date-fns";
import { DocumentActions } from "./document-actions";

export const columns: ColumnDef<Doc>[] = [
  {
    accessorKey: "recordType",
    header: "Type",
  },
  {
    accessorKey: "serviceProviderName",
    header: "Service Provider",
  },
  {
    accessorKey: "recordNumber",
    header: "Record Number",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const currency = row.getValue("currency") as string;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);
    },
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
  },
  {
    id: "actions",
    cell: ({ row }) => <DocumentActions document={row.original} />,
  },
];