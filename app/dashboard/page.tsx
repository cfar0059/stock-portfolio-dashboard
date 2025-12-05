import { StockDashboard } from "@/components/StockDashboard";

const DEFAULT_SYMBOLS = ["AMD", "GOOGL", "MSFT"];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Stock Portfolio Dashboard</h1>
      <StockDashboard symbols={DEFAULT_SYMBOLS} />
    </main>
  );
}
