"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./table/columns";
import { Doc } from "@/lib/db/schema";

export function DocumentsTable() {
  const [documents, setDocuments] = useState<Doc[]>([]);

  return <DataTable columns={columns} data={documents} />;
}