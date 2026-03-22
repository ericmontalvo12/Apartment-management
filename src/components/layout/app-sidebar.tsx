"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Layers,
  Users2,
  FileBarChart2,
  Settings,
  Hammer,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Buildings", href: "/buildings", icon: Building2 },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Daily Updates", href: "/updates", icon: ClipboardList },
      { label: "Work Queue", href: "/work-queue", icon: Layers },
      { label: "Subcontractors", href: "/subcontractors", icon: Users2 },
    ],
  },
  {
    group: "Reporting",
    items: [
      { label: "Reports", href: "/reports", icon: FileBarChart2 },
    ],
  },
  {
    group: "Admin",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r bg-card h-full sidebar-scroll overflow-y-auto">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Hammer className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">PropReno</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Renovation Ops</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-5">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                      {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User area */}
      <div className="px-4 py-3 border-t">
        {/* PERMISSION: Show role badge here */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            JL
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Jordan Lee</p>
            <p className="text-[10px] text-muted-foreground">Project Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
