import type { SortOption } from "../types";
import { Search } from "lucide-react";

interface FeedControlsProps {
  query: string;
  sort: SortOption;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}

export function FeedControls({ query, sort, onQueryChange, onSortChange }: FeedControlsProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search stories, names, moments…"
          className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-10 text-sm outline-none transition focus:border-accent/50 sm:py-2.5"
        />
      </label>
      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="w-full rounded-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent/50 sm:w-auto sm:min-w-[11.5rem] sm:py-2.5"
      >
        <option value="newest">Newest & featured</option>
        <option value="most_supported">Most supported</option>
        <option value="most_discussed">Most discussed</option>
      </select>
    </div>
  );
}
