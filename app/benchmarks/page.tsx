"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen text-foreground px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Benchmarks</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Compare your portfolio performance against market benchmarks
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Benchmark charts and analysis coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
