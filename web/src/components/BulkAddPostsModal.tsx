"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { NewSocialPostInput, SocialAccount } from "@/lib/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type ParsedRow = {
  raw: string;
  date: string;
  platform: string;
  topic: string;
  details: string;
  dateValid: boolean;
  topicValid: boolean;
};

function parseLines(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      const [date = "", platform = "", topic = "", ...rest] = raw.split("|").map((s) => s.trim());
      return {
        raw,
        date,
        platform,
        topic,
        details: rest.join(" | "),
        dateValid: date === "" || DATE_RE.test(date),
        topicValid: topic.length > 0,
      };
    });
}

export function BulkAddPostsModal({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/social/accounts")
      .then((res) => res.json())
      .then((body) => setAccounts(body.accounts ?? []));
  }, [open]);

  const rows = parseLines(text);
  const allValid = rows.length > 0 && rows.every((r) => r.dateValid && r.topicValid);

  function reset() {
    setText("");
    setError(null);
  }

  async function handleSubmit() {
    if (!allValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const posts: NewSocialPostInput[] = rows.map((r) => {
        const account = accounts.find((a) => a.platform.toLowerCase() === r.platform.toLowerCase());
        const unmatchedPlatform = r.platform && !account;
        return {
          title: r.topic,
          account_id: account?.id,
          scheduled_date: r.date || undefined,
          content: unmatchedPlatform
            ? [`Platform: ${r.platform}`, r.details].filter(Boolean).join("\n")
            : r.details || undefined,
        };
      });
      const res = await fetch("/api/social/posts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to add posts");
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div className="text-lg font-bold text-ink">Bulk Add Posts</div>
            <div className="text-xs text-ink/50">
              One post per line: <code className="rounded bg-panel px-1.5 py-0.5">date | platform | topic | details</code>.
              Date is optional (YYYY-MM-DD); platform is matched against your accounts, or kept as a note if it doesn&apos;t match.
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                "2026-09-05 | LinkedIn | Why founders stay the bottleneck | Draft angle: operational debt\n2026-09-08 | LinkedIn | Client scaling pains | \n| Instagram | Behind the scenes reel |"
              }
              className="w-full resize-none rounded-xl border border-black/10 px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-ink"
            />

            {rows.length > 0 && (
              <div className="rounded-xl bg-panel p-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  {rows.length} post{rows.length === 1 ? "" : "s"} parsed
                </div>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-2.5 py-1.5 text-xs ${
                        r.dateValid && r.topicValid ? "bg-white text-ink" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {r.topicValid ? r.topic : "Missing topic"}
                      {r.platform && <span className="text-ink/40"> · {r.platform}</span>}
                      {r.date && <span className="text-ink/40"> · {r.dateValid ? r.date : `invalid date "${r.date}"`}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !allValid}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                {submitting ? "Adding…" : `Add ${rows.length || ""} Post${rows.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
