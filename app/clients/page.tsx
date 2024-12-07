"use client";

import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/lib/api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { CreateClientDialog } from "@/components/clients/create-client-dialog";

export default function ClientsPage() {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <CreateClientDialog />
      </div>
      <DataTable columns={columns} data={clients} />
    </div>
  );
}