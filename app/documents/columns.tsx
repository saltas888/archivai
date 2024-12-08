import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/lib/db/schema";
import { format } from "date-fns";
import { DocumentActions } from "@/components/documents/table/document-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { EditableCell } from "@/components/documents/table/editable-cell";

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
    id: "file",
    header: "File",
    cell: ({ row }) => {
      const doc = row.original;
      if (!doc.fileUrl) return null;
      
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.open(doc.fileUrl, "_blank")}
          title={doc.fileName || "View document"}
        >
          <FileIcon className="h-4 w-4" />
        </Button>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "recordType",
    header: "Type",
    cell: EditableCell,
  },
  {
    accessorKey: "serviceProviderName",
    header: "Service Provider",
    cell: EditableCell,
  },
  {
    accessorKey: "vatNumber",
    header: "VAT Number",
    cell: EditableCell,
  },
  {
    accessorKey: "recordNumber",
    header: "Record Number",
    cell: EditableCell,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: EditableCell,
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: EditableCell,
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: EditableCell,
  },
  {
    accessorKey: "paidVatPercentage",
    header: "VAT %",
    cell: EditableCell,
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: EditableCell,
  },
  {
    accessorKey: "additionalInfo",
    header: "Additional Info",
    cell: EditableCell,
  },
  {
    id: "actions",
    cell: ({ row }) => <DocumentActions document={row.original} />,
    enableHiding: false,
  },
];