"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { motion } from "motion/react";
import type { SocialPost } from "@/lib/types";
import { platformColor } from "@/lib/platformColors";

type Slice = { platform: string; count: number };

function resolvePlatform(post: SocialPost, accountPlatformById: Record<string, string>): string {
  if (post.account_id && accountPlatformById[post.account_id]) {
    return accountPlatformById[post.account_id];
  }
  const match = post.content?.match(/^Platform:\s*(.+?)\s*$/m);
  return match ? match[1] : "Unspecified";
}

export function PostPlatformPieChart({
  posts,
  accountPlatformById,
}: {
  posts: SocialPost[];
  accountPlatformById: Record<string, string>;
}) {
  const slices = useMemo<Slice[]>(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      const platform = resolvePlatform(p, accountPlatformById);
      counts.set(platform, (counts.get(platform) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts, accountPlatformById]);

  const total = posts.length;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex w-[220px] flex-none flex-col rounded-[20px] bg-white p-5">
      <div className="text-[13px] font-semibold text-ink/60">By Platform</div>

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
                            const isHovered = hovered === arc.data.platform;
                            return (
                              <motion.path
                                key={arc.data.platform}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hovered && !isHovered ? 0.35 : 1 }}
                                transition={{ duration: 0.25, delay: i * 0.05 }}
                                d={pie.path(arc) ?? undefined}
                                fill={platformColor(arc.data.platform)}
                                className="cursor-pointer"
                                onMouseEnter={() => setHovered(arc.data.platform)}
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
                {hovered ? slices.find((s) => s.platform === hovered)?.count : total}
              </div>
              <div className="max-w-[80px] truncate text-[10px] font-medium text-ink/40">
                {hovered ?? "Total"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            {slices.map((s) => (
              <div
                key={s.platform}
                onMouseEnter={() => setHovered(s.platform)}
                onMouseLeave={() => setHovered(null)}
                className="flex cursor-default items-center justify-between text-xs"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-none rounded-full"
                    style={{ background: platformColor(s.platform) }}
                  />
                  <span className="truncate text-ink/60">{s.platform}</span>
                </div>
                <span className="flex-none font-semibold text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
