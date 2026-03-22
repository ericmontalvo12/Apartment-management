"use client";

import { Search } from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface FilterBarProps {
  filters: FilterOption[];
  showSearch?: boolean;
}

/**
 * Reusable filter bar.
 * TODO: Wire up URL search params for server-side filtering.
 * Use next/navigation's useRouter + useSearchParams for state management.
 */
export function FilterBar({ filters, showSearch = true }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="h-8 rounded-md border border-input bg-background px-2.5 pr-7 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          aria-label={filter.label}
        >
          {filter.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
