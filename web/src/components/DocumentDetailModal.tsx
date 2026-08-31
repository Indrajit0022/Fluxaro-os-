"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
  type KnowledgeDocument,
} from "@/lib/types";

export function DocumentDetailModal({
  documentId,
  onClose,
}: {
  documentId: string | null;
  onClose: () => void;
}) {
  if (!documentId) return null;
  return <DocumentDetailContent key={documentId} documentId={documentId} onClose={onClose} />;
}

function DocumentDetailContent({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [doc, setDoc] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("reference");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/knowledge/${documentId}`)
      .then((res) => res.json())
      .then((body) => {
        const d = body.document as KnowledgeDocument;
        setDoc(d);
        setTitle(d.title);
        setCategory(d.category);
        setContent(d.content);
      })
      .finally(() => setLoading(false));
  }, [documentId]);

  async function handleSave() {
    setBusy(true);
    try {
      const res = await fetch(`/api/knowledge/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category, content }),
      });
      const body = await res.json();
      setDoc(body.document);
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/knowledge/${documentId}`, { method: "DELETE" });
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
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !doc ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : editing ? (
          <>
            <div className="text-lg font-bold text-ink">Edit Document</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
            <label className="mt-3 text-xs font-semibold text-ink/60">
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-ink"
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
                disabled={busy || !title.trim() || !content.trim()}
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
                <div className="text-lg font-bold text-ink">{doc.title}</div>
                <span className="mt-1 inline-flex rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink">
                  {KNOWLEDGE_CATEGORY_LABELS[doc.category]}
                </span>
              </div>
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
              {doc.content}
            </div>

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
