"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/lib/db/schema";
import { format } from "date-fns";
import { DocumentActions } from "@/components/documents/table/document-actions";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<Doc>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "recordType",
    header: "Type",
  },
  {
    accessorKey: "serviceProviderName",
    header: "Service Provider",
  },
  {
    accessorKey: "vatNumber",
    header: "VAT Number",
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
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "paidVatPercentage",
    header: "VAT %",
    cell: ({ row }) => {
      const vat = row.getValue("paidVatPercentage");
      return vat ? `${vat}%` : "-";
    },
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
  },
  {
    accessorKey: "additionalInfo",
    header: "Additional Info",
  },
  {
    accessorKey: "fileName",
    header: "File Name",
  },
  {
    id: "actions",
    cell: ({ row }) => <DocumentActions document={row.original} />,
    enableHiding: false,
  },
];