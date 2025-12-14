"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Positions", href: "/" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Branding */}
        <Link
          href="/"
          className="text-lg font-semibold text-slate-100 hover:text-slate-50 transition-colors"
        >
          Portfolio
        </Link>

        {/* Navigation Items */}
        <div className="flex gap-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors pb-1 border-b-2 ${
                  active
                    ? "text-slate-100 border-slate-500"
                    : "text-slate-400 border-transparent hover:text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side placeholder (for future user menu, settings, etc.) */}
        <div className="w-12" />
      </div>
    </nav>
  );
}
