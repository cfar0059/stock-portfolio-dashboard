"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  id: string; // Unique identifier for React key
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", href: "/overview" },
  { id: "profile", label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo / Branding - Clickable link to homepage */}
        <Link
          href="/overview"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JustDCA Logo" className="h-8 w-auto" />
        </Link>

        {/* Navigation Items - Right aligned */}
        <div className="flex gap-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                suppressHydrationWarning
                className={`text-sm transition-colors ${
                  active
                    ? "text-slate-100 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
