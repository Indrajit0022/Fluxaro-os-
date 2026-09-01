"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (posts.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">
        No posts yet — add one to start the content calendar.
      </div>
    );
  }

  const allSelected = posts.length > 0 && posts.every((p) => selected.has(p.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.id)));
  }

  async function handleBulkDelete() {
    setDeleting(true);
    try {
      await fetch("/api/social/posts/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      setSelected(new Set());
      setConfirmingDelete(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] bg-white px-5 py-2">
        {selected.size > 0 ? (
          <div className="flex items-center justify-between px-1 py-3.5">
            <div className="text-[13px] font-semibold text-ink">{selected.size} selected</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelected(new Set());
                  setConfirmingDelete(false);
                }}
                className="cursor-pointer text-xs font-semibold text-ink/50 hover:text-ink"
              >
                Cancel
              </button>
              {confirmingDelete ? (
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="cursor-pointer whitespace-nowrap rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="cursor-pointer whitespace-nowrap rounded-full bg-panel px-4 py-2 text-xs font-semibold text-ink hover:bg-[#EFEFE9]"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[24px_1.6fr_1fr_1fr_0.9fr_0.9fr] items-center px-1 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-3.5 w-3.5 cursor-pointer accent-ink"
            />
            <div>Title</div>
            <div>Account</div>
            <div>Pillar</div>
            <div>Scheduled</div>
            <div>Status</div>
          </div>
        )}
        {posts.map((p) => (
          <div
            key={p.id}
            onClick={() => setOpenId(p.id)}
            className="grid cursor-pointer grid-cols-[24px_1.6fr_1fr_1fr_0.9fr_0.9fr] items-center border-t border-divider px-1 py-3 hover:bg-[#FCFCFA]"
          >
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => toggleOne(p.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-3.5 w-3.5 cursor-pointer accent-ink"
            />
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
