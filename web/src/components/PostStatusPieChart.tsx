"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { motion } from "motion/react";
import { CONTENT_STATUS_LABELS, type SocialPost, type ContentStatus } from "@/lib/types";

const STATUS_ORDER: ContentStatus[] = ["idea", "drafted", "scheduled", "posted"];
const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: "#A9B6A8",
  drafted: "#8A8A86",
  scheduled: "#D97706",
  posted: "#EAF76A",
};

type Slice = { status: ContentStatus; count: number };

export function PostStatusPieChart({ posts }: { posts: SocialPost[] }) {
  const slices = useMemo<Slice[]>(() => {
    const counts = new Map<ContentStatus, number>();
    for (const p of posts) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
    return STATUS_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 })).filter(
      (s) => s.count > 0
    );
  }, [posts]);

  const total = posts.length;
  const [hovered, setHovered] = useState<ContentStatus | null>(null);

  return (
    <div className="flex w-[220px] flex-none flex-col rounded-[20px] bg-white p-5">
      <div className="text-[13px] font-semibold text-ink/60">By Status</div>

      {total === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-ink/40">
          No posts yet
        </div>
      ) : (
        <>
          {/* ParentSize's wrapper is height:100%, which needs a real pixel
              height on this div to resolve against — see ContentHeatmap for
              the full story on why an auto-height ancestor breaks it. */}
          <div className="relative mt-2" style={{ height: 140 }}>
            <ParentSize>
              {({ width, height }) => {
                if (width <= 0 || height <= 0) return null;
                const radius = Math.min(width, height) / 2;
                return (
                  <svg width={width} height={height}>
                    <Group top={height / 2} left={width / 2}>
                      <Pie
                        data={slices}
                        pieValue={(d) => d.count}
                        outerRadius={radius}
                        innerRadius={radius - 18}
                        padAngle={0.025}
                        cornerRadius={3}
                      >
                        {(pie) =>
                          pie.arcs.map((arc, i) => {
                            const isHovered = hovered === arc.data.status;
                            return (
                              <motion.path
                                key={arc.data.status}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hovered && !isHovered ? 0.35 : 1 }}
                                transition={{ duration: 0.25, delay: i * 0.05 }}
                                d={pie.path(arc) ?? undefined}
                                fill={STATUS_COLORS[arc.data.status]}
                                className="cursor-pointer"
                                onMouseEnter={() => setHovered(arc.data.status)}
                                onMouseLeave={() => setHovered(null)}
                              />
                            );
                          })
                        }
                      </Pie>
                    </Group>
                  </svg>
                );
              }}
            </ParentSize>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-ink">
                {hovered ? slices.find((s) => s.status === hovered)?.count : total}
              </div>
              <div className="text-[10px] font-medium text-ink/40">
                {hovered ? CONTENT_STATUS_LABELS[hovered] : "Total"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            {slices.map((s) => (
              <div
                key={s.status}
                onMouseEnter={() => setHovered(s.status)}
                onMouseLeave={() => setHovered(null)}
                className="flex cursor-default items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: STATUS_COLORS[s.status] }}
                  />
                  <span className="text-ink/60">{CONTENT_STATUS_LABELS[s.status]}</span>
                </div>
                <span className="font-semibold text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
