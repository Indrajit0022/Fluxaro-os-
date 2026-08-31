"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "./Icon";

const DocumentDetailModal = dynamic(
  () => import("./DocumentDetailModal").then((m) => m.DocumentDetailModal),
  { ssr: false }
);
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
  type KnowledgeDocument,
} from "@/lib/types";

const ICON_CHECK = '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>';
const ICON_DOC = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
const ICON_BOOK = '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>';
const ICON_PEOPLE = '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>';

const CATEGORY_ICON: Record<KnowledgeCategory, string> = {
  sop: ICON_CHECK,
  template: ICON_DOC,
  reference: ICON_BOOK,
  "client-notes": ICON_PEOPLE,
};

function excerpt(content: string): string {
  const firstLine = content
    .split("\n")
    .find((line) => line.trim() && !line.trim().startsWith("#"))
    ?.trim();
  return firstLine ? (firstLine.length > 90 ? `${firstLine.slice(0, 90)}…` : firstLine) : "";
}

export function KnowledgeList({ documents }: { documents: KnowledgeDocument[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (query.trim() && !d.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [documents, query, category]);

  return (
    <>
      <div className="mt-5 flex items-center gap-3 rounded-full bg-ink px-5 py-3.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#EAF76A">
          <path d="M12 2l1.6 4.8L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.2z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the knowledge base"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
        />
      </div>

      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[13px] text-ink/55">
          Showing <span className="font-bold text-ink">{filtered.length}</span> document
          {filtered.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-medium ${
              category === "all" ? "bg-ink text-white" : "bg-white text-ink"
            }`}
          >
            All
          </button>
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-medium ${
                category === c ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {KNOWLEDGE_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-[18px] bg-white p-8 text-center text-sm text-ink/50">
            No documents match.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              onClick={() => setOpenId(d.id)}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-[18px] bg-white p-[18px] hover:bg-[#FCFCFA]"
            >
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-panel">
                  <Icon paths={CATEGORY_ICON[d.category]} color="#141414" size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">{d.title}</div>
                  <div className="mt-1 truncate text-xs leading-snug text-ink/55">{excerpt(d.content)}</div>
                </div>
              </div>
              <div className="flex-none whitespace-nowrap text-right text-[11px] text-ink/40">
                {new Date(d.updated_at).toLocaleDateString()}
                <br />
                {KNOWLEDGE_CATEGORY_LABELS[d.category]}
              </div>
            </div>
          ))
        )}
      </div>

      <DocumentDetailModal documentId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
