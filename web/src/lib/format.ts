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
