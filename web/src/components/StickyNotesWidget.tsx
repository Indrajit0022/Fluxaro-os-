"use client";

import { useEffect, useState } from "react";
import { MEMBERS, MEMBER_LABELS, type Member, type StickyNote } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { Icon } from "./Icon";

const ICON_NOTE =
  '<path d="M16 3H5a2 2 0 0 0-2 2v14l4-4h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>';

export function StickyNotesWidget() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [composing, setComposing] = useState(false);
  const [author, setAuthor] = useState<Member>("indrajit");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/sticky-notes")
      .then((res) => res.json())
      .then((body) => setNotes(body.notes ?? []))
      .finally(() => setLoaded(true));
  }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sticky-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text: text.trim() }),
      });
      const body = await res.json();
      setNotes((prev) => [body.note, ...prev]);
      setText("");
      setComposing(false);
    } finally {
      setBusy(false);
    }
  }

  async function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/sticky-notes/${id}`, { method: "DELETE" });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Notes"
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-[#2a2a2a]"
      >
        <Icon paths={ICON_NOTE} color="#EAF76A" size={20} />
        {loaded && notes.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-ink">
            {notes.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-20 flex max-h-[70vh] w-[320px] flex-col rounded-[20px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-2 border-b border-divider px-4 py-3.5">
        <div className="flex-1 text-sm font-bold text-ink">Notes</div>
        <button onClick={() => setOpen(false)} className="cursor-pointer text-ink/40 hover:text-ink">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!loaded ? (
          <div className="py-6 text-center text-xs text-ink/40">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink/40">No notes yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div key={note.id} className="group rounded-xl bg-panel p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-ink">{MEMBER_LABELS[note.author]}</span>
                  <span className="text-[10px] text-ink/40">{relativeTime(note.created_at)}</span>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="ml-auto cursor-pointer text-[11px] text-ink/30 opacity-0 hover:text-red-600 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink/80">{note.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-divider p-3">
        {composing ? (
          <form onSubmit={addNote} className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              {MEMBERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAuthor(m)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: author === m ? "#141414" : "#F4F3EF",
                    color: author === m ? "#fff" : "#141414",
                  }}
                >
                  {MEMBER_LABELS[m]}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              autoFocus
              placeholder="Leave a short note…"
              className="w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-xs text-ink outline-none focus:border-ink"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setComposing(false);
                  setText("");
                }}
                className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-ink/60 hover:bg-panel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="cursor-pointer rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="w-full cursor-pointer rounded-full bg-panel py-2 text-xs font-semibold text-ink hover:bg-[#EFEFE9]"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}
