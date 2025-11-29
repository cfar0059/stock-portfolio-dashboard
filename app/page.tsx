import {Button} from "@/components/ui/button";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
                {/* Top header */}
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Stock Portfolio Dashboard
                        </h1>
                        <p className="text-sm text-slate-400">
                            Day 1 – Layout only. Data integration starts next.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-white text-black border border-slate-300 hover:bg-slate-100 text-xs md:text-sm"
                        >
                            Refresh (soon)
                        </Button>
                        <Button className="text-xs md:text-sm">Add Position (soon)</Button>
                    </div>
                </header>

                {/* Summary cards */}
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-slate-400">
                                Total Portfolio Value
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">€0.00</p>
                            <p className="text-xs text-slate-500 mt-1">Based on live prices</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-slate-400">
                                Daily P/L
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-emerald-400">+€0.00</p>
                            <p className="text-xs text-slate-500 mt-1">vs. previous close</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-slate-400">
                                Open Positions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">0</p>
                            <p className="text-xs text-slate-500 mt-1">Tracked in this dashboard</p>
                        </CardContent>
                    </Card>
                </section>

                {/* Placeholder for positions table */}
                <section>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Positions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400">
                                No data yet. Tomorrow this becomes a table with your holdings and live
                                prices.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
