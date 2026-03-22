"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-card px-6">
      {/* Global search — TODO: implement with cmdk */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search buildings, units..."
          className="h-7 w-full rounded-md border border-input bg-muted/50 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications — TODO: connect to notification model */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </Button>
      </div>
    </header>
  );
}
