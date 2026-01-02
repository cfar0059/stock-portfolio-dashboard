"use client";

import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route to page title mapping
const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/positions": "Positions",
  "/benchmarks": "Benchmarks",
  "/alerts": "Alerts",
  "/profile": "Profile",
};

// Fixed header height for consistent spacing
const DESKTOP_HEADER_HEIGHT = "h-12";

export function AppDesktopHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <header
      className={`hidden lg:flex ${DESKTOP_HEADER_HEIGHT} border-b border-border bg-card items-center justify-between px-6 fixed top-0 right-0 left-64 z-30`}
    >
      {/* Page Title */}
      <div className="flex items-center">
        <h1 className="text-sm font-medium text-foreground">{pageTitle}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Profile"
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
