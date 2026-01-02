import React from "react";

interface HeaderProps {
  isAddOpen: boolean;
  onRefresh: () => void;
  onToggleAdd: () => void;
}

export function Header({ isAddOpen, onRefresh, onToggleAdd }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Stock Portfolio Dashboard</h1>
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <button
          className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={onToggleAdd}
        >
          {isAddOpen ? "Close" : "Add Position"}
        </button>
      </div>
    </div>
  );
}
