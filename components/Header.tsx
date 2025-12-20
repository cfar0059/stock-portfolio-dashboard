import React from "react";

interface HeaderProps {
  isAddOpen: boolean;
  onRefresh: () => void;
  onToggleAdd: () => void;
}

export function Header({
  isAddOpen,
  onRefresh,
  onToggleAdd,
  breakTS,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Stock Portfolio Dashboard</h1>
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 cursor-pointer hover:bg-slate-200 transition-colors"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 cursor-pointer hover:bg-slate-700 transition-colors"
          onClick={onToggleAdd}
        >
          {isAddOpen ? "Close" : "Add Position"}
        </button>
      </div>
    </div>
  );
}
