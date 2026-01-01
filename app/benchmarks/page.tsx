"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen text-slate-100 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Benchmarks</h1>
        <p className="text-sm text-slate-400 mt-2">
          Compare your portfolio performance against market benchmarks
        </p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-12 text-center">
          <p className="text-slate-400">
            Benchmark charts and analysis coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
