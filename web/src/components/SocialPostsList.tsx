"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  CONTENT_PILLAR_LABELS,
  CONTENT_STATUS_LABELS,
  type SocialPost,
  type ContentStatus,
} from "@/lib/types";

const SocialPostDetailModal = dynamic(
  () => import("./SocialPostDetailModal").then((m) => m.SocialPostDetailModal),
  { ssr: false }
);

function statusStyle(status: ContentStatus) {
  if (status === "posted") return { background: "#EAF76A", color: "#141414" };
  if (status === "scheduled") return { background: "#FFFBEB", color: "#D97706" };
  if (status === "drafted") return { background: "#F4F3EF", color: "#141414" };
  return { background: "#F4F3EF", color: "rgba(20,20,20,0.5)" };
}

export function SocialPostsList({
  posts,
  accountLabelById,
}: {
  posts: SocialPost[];
  accountLabelById: Record<string, string>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">
        No posts yet — add one to start the content calendar.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] bg-white px-5 py-2">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr] px-1 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          <div>Title</div>
          <div>Account</div>
          <div>Pillar</div>
          <div>Scheduled</div>
          <div>Status</div>
        </div>
        {posts.map((p) => (
          <div
            key={p.id}
            onClick={() => setOpenId(p.id)}
            className="grid cursor-pointer grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr] items-center border-t border-divider px-1 py-3 hover:bg-[#FCFCFA]"
          >
            <div className="truncate text-[13px] font-semibold text-ink">{p.title}</div>
            <div className="truncate text-xs text-ink/60">
              {p.account_id ? accountLabelById[p.account_id] ?? "—" : "—"}
            </div>
            <div className="truncate text-xs text-ink/60">{p.pillar ? CONTENT_PILLAR_LABELS[p.pillar] : "—"}</div>
            <div className="text-xs text-ink/60">
              {p.scheduled_date
                ? new Date(`${p.scheduled_date}T00:00:00`).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </div>
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={statusStyle(p.status)}
              >
                {CONTENT_STATUS_LABELS[p.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SocialPostDetailModal postId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
