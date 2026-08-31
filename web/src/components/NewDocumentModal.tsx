"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
  type NewKnowledgeDocumentInput,
} from "@/lib/types";

export function NewDocumentModal({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("reference");
  const [content, setContent] = useState("");

  function reset() {
    setTitle("");
    setCategory("reference");
    setContent("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: NewKnowledgeDocumentInput = { title: title.trim(), category, content };
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save document");
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
            <div className="text-lg font-bold text-ink">New Document</div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Discovery Call Script"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  {KNOWLEDGE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {KNOWLEDGE_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-xs font-semibold text-ink/60">
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Write or paste the document content (markdown is fine)…"
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-ink"
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
                {submitting ? "Saving…" : "Save Document"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
