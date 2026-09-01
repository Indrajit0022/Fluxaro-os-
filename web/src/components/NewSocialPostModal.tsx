"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONTENT_PILLARS,
  CONTENT_PILLAR_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  type ContentPillar,
  type ContentStatus,
  type NewSocialPostInput,
  type SocialAccount,
} from "@/lib/types";

export function NewSocialPostModal({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<ContentPillar | "">("");
  const [status, setStatus] = useState<ContentStatus>("idea");
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/social/accounts")
      .then((res) => res.json())
      .then((body) => setAccounts(body.accounts ?? []));
  }, [open]);

  function reset() {
    setAccountId("");
    setTitle("");
    setContent("");
    setPillar("");
    setStatus("idea");
    setScheduledDate("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: NewSocialPostInput = {
        account_id: accountId || undefined,
        title: title.trim(),
        content: content.trim() || undefined,
        pillar: pillar || undefined,
        status,
        scheduled_date: scheduledDate || undefined,
      };
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save post");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="flex max-h-[85vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div className="text-lg font-bold text-ink">New Post</div>

            <label className="text-xs font-semibold text-ink/60">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Why businesses get messy as they scale"
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
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

            <label className="text-xs font-semibold text-ink/60">
              Content / caption
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>

            {error && <div className="text-xs font-medium text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-panel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save Post"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
