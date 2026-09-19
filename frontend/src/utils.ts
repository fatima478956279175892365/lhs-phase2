export function formatRelativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(seconds) < 60) return rtf.format(-seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(-days, "day");
  const weeks = Math.round(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(-weeks, "week");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(days / 365), "year");
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 180));
}

export function categoryLabel(id: string): string {
  const map: Record<string, string> = {
    "seeking-advice": "Seeking advice",
    work: "Work",
    "home-marriage": "Home & marriage",
    "daily-life": "Daily life",
    lessons: "Lessons",
    support: "Support",
    other: "Other",
  };
  return map[id] ?? id;
}

export function categoryTone(id: string): string {
  const map: Record<string, string> = {
    "seeking-advice": "bg-accent-soft text-accent-dark",
    work: "bg-[#e8edf0] text-ink-soft",
    "home-marriage": "bg-[#f0e8ea] text-[#6b4048]",
    "daily-life": "bg-[#e4eceb] text-accent",
    lessons: "bg-[#efe6da] text-accent-warm",
    support: "bg-accent-soft text-accent-dark",
    other: "bg-[#ebe6dd] text-ink-soft",
  };
  return map[id] ?? map.other;
}
