import { Link } from "react-router-dom";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  onNewStory: () => void;
  healthOk?: boolean;
}

export function Header({ onNewStory, healthOk = true }: HeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link to="/" className="group min-w-0 flex items-baseline gap-2">
          <span className="font-display truncate text-xl font-semibold tracking-tight text-ink transition group-hover:text-accent sm:text-2xl">
            Let Her Speak
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          <a href="/#stories" className="hover:text-ink">
            Circle
          </a>
          <Link to="/safety" className="hover:text-ink">
            Safety
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
            <span className={`status-dot size-2 rounded-full ${healthOk ? "bg-accent" : "bg-danger"}`} />
            {healthOk ? "Operational" : "Degraded"}
          </div>
          <button
            type="button"
            onClick={onNewStory}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-medium text-surface transition hover:bg-accent-dark"
          >
            <Plus className="size-4" />
            New post
          </button>
        </nav>

        <button
          type="button"
          className="shrink-0 rounded-full border border-border p-2.5 text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
              <span className={`status-dot size-2 rounded-full ${healthOk ? "bg-accent" : "bg-danger"}`} />
              {healthOk ? "Operational" : "Degraded"}
            </div>
            <a href="/#stories" className="py-1" onClick={() => setOpen(false)}>
              Circle
            </a>
            <Link to="/safety" className="py-1" onClick={() => setOpen(false)}>
              Safety
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onNewStory();
              }}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-medium text-surface"
            >
              <Plus className="size-4" />
              New post
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
