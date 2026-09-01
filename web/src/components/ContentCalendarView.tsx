"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { SocialPost } from "@/lib/types";
import { SocialPostsList } from "./SocialPostsList";

// The heatmap needs a browser layout measurement (@visx/responsive's
// ParentSize) to render at all, so there's nothing useful to server-render —
// and it pulls in visx + motion, ~135K of JS that shouldn't block the
// initial page load. Deferred with a same-shaped skeleton to avoid layout
// shift once it mounts.
const ContentHeatmap = dynamic(() => import("./ContentHeatmap").then((m) => m.ContentHeatmap), {
  ssr: false,
  loading: () => <div className="h-[140px] animate-pulse rounded-xl bg-panel" />,
});

const PostPlatformPieChart = dynamic(
  () => import("./PostPlatformPieChart").then((m) => m.PostPlatformPieChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-[220px] flex-none animate-pulse rounded-[20px] bg-white" />,
  }
);

export function ContentCalendarView({
  posts,
  accountLabelById,
  accountPlatformById,
}: {
  posts: SocialPost[];
  accountLabelById: Record<string, string>;
  accountPlatformById: Record<string, string>;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dates = useMemo(
    () => posts.map((p) => p.scheduled_date).filter((d): d is string => Boolean(d)),
    [posts]
  );

  const filtered = selectedDate ? posts.filter((p) => p.scheduled_date === selectedDate) : posts;

  return (
    <>
      <div className="flex items-stretch gap-4">
        <div className="min-w-0 flex-1 rounded-[20px] bg-white p-5">
          <ContentHeatmap dates={dates} onSelectDate={setSelectedDate} />
        </div>
        <PostPlatformPieChart posts={posts} accountPlatformById={accountPlatformById} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-[15px] font-bold text-ink">
          {selectedDate
            ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })
            : "All Posts"}
        </div>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="cursor-pointer text-xs font-semibold text-ink/50 hover:text-ink"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      <SocialPostsList posts={filtered} accountLabelById={accountLabelById} />
    </>
  );
}
