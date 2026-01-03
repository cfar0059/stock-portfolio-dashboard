"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Settings, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems, pageTitles } from "@/lib/navigation";

// Fixed header height for consistent spacing
const HEADER_HEIGHT = "h-14";

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Fixed Header */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${HEADER_HEIGHT} bg-card border-b border-border flex items-center justify-between px-4`}
      >
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-bold text-foreground">{pageTitle}</h1>
        </div>

        {/* Right: Settings + Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Profile"
            >
              <User className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Overlay + Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Navigation drawer */}
          <nav
            className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[80vw] max-w-sm bg-card border-r border-border shadow-2xl"
            aria-label="Mobile navigation"
          >
            {/* Drawer Header with Brand + Close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <Link
                href="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="JustDCA Logo"
                  className="h-8 w-auto"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="py-4 px-3">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </nav>
        </>
      )}
    </>
  );
}
