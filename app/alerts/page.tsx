"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function AlertsPage() {
  return (
    <div className="min-h-screen text-foreground px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage DCA triggers and price alerts
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Alert configuration and notifications coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
