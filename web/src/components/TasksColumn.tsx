"use client";

import { useState } from "react";
import { MEMBER_LABELS, type DailyChecklistEntry, type DailyChecklistItem, type DailyTask, type Member } from "@/lib/types";
import { initialOf } from "@/lib/format";

export function TasksColumn({
  member,
  items,
  entries,
  tasks,
  onToggleChecklist,
  onAddTask,
  onToggleTaskDone,
  onDeleteTask,
}: {
  member: Member;
  items: DailyChecklistItem[];
  entries: DailyChecklistEntry[];
  tasks: DailyTask[];
  onToggleChecklist: (itemId: string) => void;
  onAddTask: (text: string) => void;
  onToggleTaskDone: (task: DailyTask) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onAddTask(draft.trim());
    setDraft("");
  }

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
          {initialOf(MEMBER_LABELS[member])}
        </div>
        <div className="text-[15px] font-bold text-ink">{MEMBER_LABELS[member]}</div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          {items.map((item) => {
            const checked = entries.find((e) => e.item_id === item.id)?.checked ?? false;
            return (
              <button
                key={item.id}
                onClick={() => onToggleChecklist(item.id)}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-panel"
              >
                <span
                  className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    background: checked ? "#EAF76A" : "#F4F3EF",
                    color: checked ? "#141414" : "rgba(20,20,20,0.3)",
                  }}
                >
                  {checked ? "✓" : ""}
                </span>
                <span className={`text-sm ${checked ? "text-ink" : "text-ink/60"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1 border-t border-divider pt-3">
        {tasks.length === 0 && <div className="px-2.5 py-1 text-xs text-ink/40">Nothing typed yet.</div>}
        {tasks.map((task) => (
          <div key={task.id} className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-panel">
            <button
              onClick={() => onToggleTaskDone(task)}
              className="flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: task.done ? "#EAF76A" : "#F4F3EF",
                color: task.done ? "#141414" : "rgba(20,20,20,0.3)",
              }}
            >
              {task.done ? "✓" : ""}
            </button>
            <span
              className={`flex-1 text-sm ${task.done ? "text-ink/40 line-through" : "text-ink"}`}
            >
              {task.text}
            </span>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="flex-none cursor-pointer text-xs text-ink/30 opacity-0 hover:text-red-600 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={submitTask} className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What are you working on…"
          className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <button
          type="submit"
          className="flex-none cursor-pointer rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-[#2a2a2a]"
        >
          Add
        </button>
      </form>
    </div>
  );
}
