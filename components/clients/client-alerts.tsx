import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/db/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ClientAlertsProps {
  client: Client;
}

export function ClientAlerts({ client }: ClientAlertsProps) {
  // Example alerts - you can customize these based on your needs
  const alerts = [
    {
      type: "warning",
      title: "Missing Documents",
      description: "No recent documents uploaded in the last 30 days.",
      icon: AlertCircle,
    },
    {
      type: "success",
      title: "Up to Date",
      description: "All required information is complete.",
      icon: CheckCircle2,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            variant={alert.type === "warning" ? "destructive" : "default"}
          >
            <alert.icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}