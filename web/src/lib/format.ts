export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0";
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value}`;
}

export function formatCurrencyFull(value: number | null | undefined): string {
  if (value == null) return "$0";
  return `$${value.toLocaleString("en-US")}`;
}

export function capsules(filled: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    filled: i < filled,
  }));
}

export function isWithinLastDays(iso: string, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

// Whole-day difference between a YYYY-MM-DD date string and today, ignoring
// time-of-day. Negative = overdue, 0 = today, positive = upcoming.
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
