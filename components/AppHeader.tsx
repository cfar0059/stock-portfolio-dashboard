"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", href: "/overview" },
  { id: "positions", label: "Positions", href: "/positions" },
  { id: "benchmarks", label: "Benchmarks", href: "/benchmarks" },
  { id: "alerts", label: "Alerts", href: "/alerts" },
  { id: "profile", label: "Profile", href: "/profile" },
];

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/overview"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JustDCA Logo" className="h-7 w-auto" />
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-slate-100"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-slate-800 bg-slate-950">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-slate-800 text-slate-100 font-medium"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
