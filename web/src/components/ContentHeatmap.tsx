"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { HeatmapRect } from "@visx/heatmap";
import { motion } from "motion/react";
import { buildHeatmapColumns, heatmapColor, HEATMAP_LEVEL_COLORS, type HeatmapBin } from "@/lib/heatmap";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const GAP = 3;
const MARGIN = { top: 20, right: 8, bottom: 0, left: 28 };

export function ContentHeatmap({
  dates,
  onSelectDate,
}: {
  dates: string[];
  onSelectDate: (date: string) => void;
}) {
  const weeks = 26;
  const columns = useMemo(() => buildHeatmapColumns(dates, weeks), [dates]);
  const max = useMemo(
    () => Math.max(1, ...columns.flatMap((c) => c.bins.map((b) => b.count))),
    [columns]
  );

  const [hovered, setHovered] = useState<{ bin: HeatmapBin; x: number; y: number } | null>(null);

  // Month label at the first column that lands in a new month.
  const monthTicks = useMemo(() => {
    const seen = new Set<string>();
    const ticks: { colIndex: number; label: string }[] = [];
    columns.forEach((col, i) => {
      const d = new Date(`${col.bins[0].date}T00:00:00`);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        ticks.push({ colIndex: i, label: MONTH_LABELS[d.getMonth()] });
      }
    });
    return ticks;
  }, [columns]);

  return (
    // ParentSize's own wrapper is height:100%, which resolves to 0 against
    // an auto-height ancestor — its measurement div then clips the SVG to
    // nothing (overflow:hidden), even though the SVG itself renders with a
    // real, explicit height. A fixed pixel height here is what the
    // percentage actually resolves against.
    <div className="relative" style={{ height: 170 }}>
      <ParentSize>
        {({ width }) => {
          if (width <= 0) return null;
          const innerWidth = width - MARGIN.left - MARGIN.right;
          const binSize = Math.max(6, Math.min(14, innerWidth / weeks - GAP));
          const binWidth = binSize + GAP;
          const binHeight = binSize + GAP;
          const height = MARGIN.top + binHeight * 7 + MARGIN.bottom;

          return (
            <svg width={width} height={height}>
              <Group left={MARGIN.left} top={MARGIN.top}>
                {monthTicks.map((t) => (
                  <text
                    key={t.label + t.colIndex}
                    x={t.colIndex * binWidth}
                    y={-8}
                    fontSize={10}
                    fontWeight={600}
                    fill="rgba(20,20,20,0.4)"
                  >
                    {t.label}
                  </text>
                ))}
                <HeatmapRect
                  data={columns}
                  bins={(c) => c.bins}
                  count={(b) => b.count}
                  xScale={(i) => i * binWidth}
                  yScale={(i) => i * binHeight}
                  binWidth={binSize}
                  binHeight={binSize}
                  gap={0}
                  colorScale={(count) => heatmapColor(Number(count), max)}
                >
                  {(cells) =>
                    cells.map((cellRow) =>
                      cellRow.map((cell) => (
                        <motion.rect
                          key={`${cell.column}-${cell.row}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: (cell.column * 7 + cell.row) * 0.002 }}
                          x={cell.x}
                          y={cell.y}
                          width={cell.width}
                          height={cell.height}
                          rx={2}
                          fill={cell.color}
                          className="cursor-pointer"
                          onMouseEnter={(e) => {
                            const rect = (e.target as SVGRectElement).getBoundingClientRect();
                            setHovered({ bin: cell.bin, x: rect.left, y: rect.top });
                          }}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => onSelectDate(cell.bin.date)}
                        />
                      ))
                    )
                  }
                </HeatmapRect>
              </Group>
              <Group left={0} top={MARGIN.top}>
                {WEEKDAY_LABELS.map((label, i) =>
                  i % 2 === 1 ? (
                    <text
                      key={label}
                      x={0}
                      y={i * binHeight + binSize / 2 + 3}
                      fontSize={9}
                      fill="rgba(20,20,20,0.4)"
                    >
                      {label[0]}
                    </text>
                  ) : null
                )}
              </Group>
            </svg>
          );
        }}
      </ParentSize>

      {hovered && (
        <div
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg"
          style={{ left: hovered.x, top: hovered.y - 6 }}
        >
          <div className="font-semibold">
            {hovered.bin.count} post{hovered.bin.count === 1 ? "" : "s"}
          </div>
          <div className="text-white/60">
            {new Date(`${hovered.bin.date}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-ink/40">
        Less
        {HEATMAP_LEVEL_COLORS.map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
        ))}
        More
      </div>
    </div>
  );
}
