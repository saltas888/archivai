"use client";

import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "./data-table";
import { useDocumentsColumns } from './columns';
import { UploadDialog } from "@/components/documents/upload-dialog";
import { getDocuments } from "@/lib/api";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DocumentFilters } from "./filters";
import { useTranslations } from 'next-intl';

export default function DocumentsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('documents');
  const commonT = useTranslations('common');

  const { data: documents = [], isError } = useQuery({
    queryKey: ["documents", searchParams.toString()],
    queryFn: () => getDocuments(Object.fromEntries(searchParams)),
  });

  const columns = useDocumentsColumns();

  if (isError) {
    toast({
      title: commonT('error'),
      description: t('errors.fetchFailed'),
      variant: "destructive",
    });
  }

  const onFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "undefined" || (value === "all")) {
      params.delete(key);
    }
    else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
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

