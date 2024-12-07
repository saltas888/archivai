"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { TopProviders } from "@/components/dashboard/top-providers";
import { DocTypeDistribution } from "@/components/dashboard/doc-type-distribution";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => getDocuments(),
  });

  const totalAmount = documents.reduce((sum, doc) => sum + Number(doc.totalAmount), 0);
  const totalDocuments = documents.length;
  const uniqueProviders = new Set(documents.map(doc => doc.serviceProviderName)).size;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueProviders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={documents} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProviders data={documents} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Document Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DocTypeDistribution data={documents} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentDocuments data={documents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}