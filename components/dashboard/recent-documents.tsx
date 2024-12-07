"use client";

import { Doc } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface RecentDocumentsProps {
  data: Doc[];
}

export function RecentDocuments({ data }: RecentDocumentsProps) {
  const recentDocs = [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recentDocs.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{doc.serviceProviderName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(doc.date), "PPP")}
            </p>
          </div>
          <div className="text-sm font-medium">
            {formatCurrency(Number(doc.totalAmount))}
          </div>
        </div>
      ))}
    </div>
  );
}