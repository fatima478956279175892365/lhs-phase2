import { CATEGORIES } from "../types";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
      {CATEGORIES.map((category) => {
        const active = value === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition sm:py-1.5 ${
              active
                ? "bg-accent text-surface"
                : "border border-border bg-surface/80 text-ink-soft hover:border-accent/30"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
