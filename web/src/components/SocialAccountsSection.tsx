"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SocialAccount } from "@/lib/types";

export function SocialAccountsSection({ accounts }: { accounts: SocialAccount[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState("");
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!platform.trim() || !handle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.trim(), handle: handle.trim(), url: url.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setPlatform("");
      setHandle("");
      setUrl("");
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(account: SocialAccount) {
    setBusyId(account.id);
    try {
      await fetch(`/api/social/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !account.active }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/social/accounts/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[15px] font-bold text-ink">Accounts</div>
        <button
          onClick={() => setAdding((s) => !s)}
          className="cursor-pointer text-xs font-semibold text-ink"
        >
          {adding ? "Cancel" : "+ Add Account"}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 border-t border-divider py-3">
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Platform (e.g. LinkedIn)"
            className="min-w-0 flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
          />
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@handle"
            className="min-w-0 flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Profile URL (optional)"
            className="min-w-0 flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex-none cursor-pointer rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      {accounts.length === 0 && !adding && (
        <div className="py-3 text-xs text-ink/40">No accounts yet.</div>
      )}

      {accounts.map((a) => (
        <div key={a.id} className="group flex items-center gap-3 border-t border-divider py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink">{a.platform}</div>
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-ink/50 hover:underline"
              >
                {a.handle}
              </a>
            ) : (
              <div className="text-xs text-ink/50">{a.handle}</div>
            )}
          </div>
          <button
            onClick={() => toggleActive(a)}
            disabled={busyId === a.id}
            className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
            style={{
              background: a.active ? "#EAF76A" : "#F4F3EF",
              color: a.active ? "#141414" : "rgba(20,20,20,0.5)",
            }}
          >
            {a.active ? "Active" : "Paused"}
          </button>
          <button
            onClick={() => remove(a.id)}
            disabled={busyId === a.id}
            className="flex-none cursor-pointer text-xs text-ink/30 opacity-0 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
