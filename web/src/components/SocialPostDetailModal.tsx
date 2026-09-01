"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONTENT_PILLARS,
  CONTENT_PILLAR_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  type ContentPillar,
  type ContentStatus,
  type SocialAccount,
  type SocialPost,
} from "@/lib/types";

export function SocialPostDetailModal({
  postId,
  onClose,
}: {
  postId: string | null;
  onClose: () => void;
}) {
  if (!postId) return null;
  return <SocialPostDetailContent key={postId} postId={postId} onClose={onClose} />;
}

function SocialPostDetailContent({ postId, onClose }: { postId: string; onClose: () => void }) {
  const router = useRouter();
  const [post, setPost] = useState<SocialPost | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<ContentPillar | "">("");
  const [status, setStatus] = useState<ContentStatus>("idea");
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/social/posts/${postId}`).then((res) => res.json()),
      fetch("/api/social/accounts").then((res) => res.json()),
    ]).then(([postBody, accountsBody]) => {
      const p = postBody.post as SocialPost;
      setPost(p);
      setAccounts(accountsBody.accounts ?? []);
      setAccountId(p.account_id ?? "");
      setTitle(p.title);
      setContent(p.content ?? "");
      setPillar(p.pillar ?? "");
      setStatus(p.status);
      setScheduledDate(p.scheduled_date ?? "");
      setLoading(false);
    });
  }, [postId]);

  const account = accounts.find((a) => a.id === post?.account_id);

  async function handleSave() {
    setBusy(true);
    try {
      const res = await fetch(`/api/social/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId || null,
          title: title.trim(),
          content: content.trim() || null,
          pillar: pillar || null,
          status,
          scheduled_date: scheduledDate || null,
        }),
      });
      const body = await res.json();
      setPost(body.post);
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/social/posts/${postId}`, { method: "DELETE" });
      router.refresh();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !post ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : editing ? (
          <>
            <div className="text-lg font-bold text-ink">Edit Post</div>
            <label className="mt-3 text-xs font-semibold text-ink/60">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Account
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  <option value="">— None —</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.platform} · {a.handle}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Content pillar
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as ContentPillar | "")}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  <option value="">— None —</option>
                  {CONTENT_PILLARS.map((p) => (
                    <option key={p} value={p}>
                      {CONTENT_PILLAR_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CONTENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Scheduled date
                <input
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>
            <label className="mt-3 text-xs font-semibold text-ink/60">
              Content / caption
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={busy || !title.trim()}
                className="cursor-pointer rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-ink">{post.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink">
                    {CONTENT_STATUS_LABELS[post.status]}
                  </span>
                  {post.pillar && (
                    <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink">
                      {CONTENT_PILLAR_LABELS[post.pillar]}
                    </span>
                  )}
                  {account && (
                    <span className="text-xs text-ink/50">
                      {account.platform} · {account.handle}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm text-ink">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                Scheduled date
              </div>
              <div className="mt-0.5">
                {post.scheduled_date
                  ? new Date(`${post.scheduled_date}T00:00:00`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not scheduled"}
              </div>
            </div>

            {post.content && (
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  Content / caption
                </div>
                <div className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                  {post.content}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 cursor-pointer rounded-full bg-panel py-2.5 text-sm font-semibold text-ink hover:bg-[#EFEFE9]"
              >
                Edit
              </button>
            </div>

            <div className="mt-2">
              {confirmingDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="w-full cursor-pointer rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full cursor-pointer rounded-full py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
