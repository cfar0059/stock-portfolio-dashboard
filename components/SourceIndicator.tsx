import React from "react";

interface SourceIndicatorProps {
  source: "cache" | "live";
}

export function SourceIndicator({ source }: SourceIndicatorProps) {
  const isLive = source === "live";
  const bgColor = isLive ? "bg-green-500" : "bg-orange-500";
  const tooltip = isLive ? "Live Data" : "Cached Data";

  return (
    <div
      className={`inline-block w-2 h-2 rounded-full ${bgColor}`}
      title={tooltip}
      aria-label={tooltip}
    />
  );
}

