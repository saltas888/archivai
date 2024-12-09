"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { ClientSummary } from "@/components/clients/client-summary";
import { ClientAlerts } from "@/components/clients/client-alerts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClientInvoices } from "@/components/clients/client-invoices";

async function getClient(id: string) {
  const response = await fetch(`/api/clients/${id}`);
  if (!response.ok) throw new Error("Failed to fetch client");
  return response.json();
}

export default function ClientSpacePage() {
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading, error } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <Alert variant="destructive"> 
        <AlertTitle>Oops</AlertTitle>
        <AlertDescription className="mt-2">
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{client.name}</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <ClientSummary client={client} />
        <ClientAlerts client={client} />
      </div>
      
      <div className="grid grid-cols-1">
        <ClientInvoices clientId={clientId} />
      </div>
    </div>
  );
}