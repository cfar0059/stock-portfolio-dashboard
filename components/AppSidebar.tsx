"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LayoutDashboard, List, TrendingUp, User } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  { id: "positions", label: "Positions", href: "/positions", icon: List },
  {
    id: "benchmarks",
    label: "Benchmarks",
    href: "/benchmarks",
    icon: TrendingUp,
  },
  { id: "alerts", label: "Alerts", href: "/alerts", icon: Bell },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 z-40 hidden lg:flex lg:flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <Link
          href="/overview"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JustDCA Logo" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                suppressHydrationWarning
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-slate-800 text-slate-100 font-medium"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
