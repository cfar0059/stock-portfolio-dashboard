"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function PositionsPage() {
  return (
    <div className="min-h-screen text-foreground px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Positions</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Detailed position management and analytics
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Positions page coming soon. For now, use Overview to manage your
            positions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
