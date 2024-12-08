import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/db/schema";
import { format } from "date-fns";

interface ClientSummaryProps {
  client: Client;
}

export function ClientSummary({ client }: ClientSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          )}
          {client.vat && (
            <div>
              <p className="text-sm text-muted-foreground">VAT Number</p>
              <p className="font-medium">{client.vat}</p>
            </div>
          )}
          {client.address && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{client.address}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Client Since</p>
            <p className="font-medium">
              {format(new Date(client.createdAt), "PPP")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}