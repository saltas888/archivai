"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { getDocuments } from "@/lib/api";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DocumentFilters } from "./filters";

export default function DocumentsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: documents = [], isError } = useQuery({
    queryKey: ["documents", searchParams.toString()],
    queryFn: () => getDocuments(Object.fromEntries(searchParams)),
  });


  if (isError) {
    toast({
      title: "Error",
      description: "Failed to fetch documents",
      variant: "destructive",
    });
  }

  const onFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <UploadDialog />
        </div>
      </div>
      <DocumentFilters onFilterChange={onFilterChange} />
      <DataTable columns={columns} data={documents} />
    </div>
  );
}

interface DeleteDocumentsButtonProps {
  onDelete: (ids: number[]) => void;
}

