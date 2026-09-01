"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TeamMember } from "@/lib/types";
import { initialOf } from "@/lib/format";

export function TeamSection({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setName("");
      setRole("");
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await fetch(`/api/team/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[15px] font-bold text-ink">Team</div>
        <button
          onClick={() => setAdding((s) => !s)}
          className="cursor-pointer text-xs font-semibold text-ink"
        >
          {adding ? "Cancel" : "+ Invite"}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 border-t border-divider py-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="min-w-0 flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
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

      {members.map((tm) => (
        <div key={tm.id} className="group flex items-center gap-3 border-t border-divider py-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
            {initialOf(tm.name)}
          </div>
          <div className="min-w-0 flex-1 text-[13px] font-semibold text-ink">{tm.name}</div>
          <div className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink/60">
            {tm.role}
          </div>
          <button
            onClick={() => handleRemove(tm.id)}
            disabled={removingId === tm.id}
            className="flex-none cursor-pointer text-xs text-ink/30 opacity-0 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
