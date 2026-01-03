"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navItems } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-40 hidden lg:flex lg:flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <Link
          href="/overview"
          className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JustDCA Logo" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                suppressHydrationWarning
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
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
