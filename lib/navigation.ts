import type { ComponentType } from "react";
import { Bell, LayoutDashboard, List, TrendingUp, User } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
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

export const pageTitles = Object.fromEntries(
  navItems.map((item) => [item.href, item.label]),
) as Record<string, string>;
