export type HeatmapBin = {
  bin: number; // 0 (Sun) .. 6 (Sat)
  count: number;
  date: string; // YYYY-MM-DD
};

export type HeatmapColumn = {
  bin: number; // week index
  bins: HeatmapBin[];
};

/**
 * Buckets items into a Sunday-first week-by-day grid covering the last
 * `weeks` weeks up to and including the current week, matching the
 * {bin, bins:[{bin,count,date}]} shape a visx-based calendar heatmap expects.
 */
export function buildHeatmapColumns(
  dates: string[],
  weeks = 26
): HeatmapColumn[] {
  const counts = new Map<string, number>();
  for (const d of dates) {
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const firstWeekStart = new Date(currentWeekStart);
  firstWeekStart.setDate(currentWeekStart.getDate() - (weeks - 1) * 7);

  const columns: HeatmapColumn[] = [];
  for (let w = 0; w < weeks; w++) {
    const bins: HeatmapBin[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstWeekStart);
      date.setDate(firstWeekStart.getDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      bins.push({ bin: d, count: counts.get(key) ?? 0, date: key });
    }
    columns.push({ bin: w, bins });
  }
  return columns;
}

// Empty cell, then four intensifying steps toward the lime brand accent.
export const HEATMAP_LEVEL_COLORS = ["#F4F3EF", "#DCE9A6", "#C7DD7E", "#B4D157", "#EAF76A"];

export function heatmapLevel(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  const step = max / 4;
  return Math.min(4, Math.max(1, Math.ceil(count / step)));
}

export function heatmapColor(count: number, max: number): string {
  return HEATMAP_LEVEL_COLORS[heatmapLevel(count, max)];
}
