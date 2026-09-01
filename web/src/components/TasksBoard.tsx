"use client";

import { useEffect, useState } from "react";
import {
  MEMBERS,
  type DailyChecklistEntry,
  type DailyChecklistItem,
  type DailyTask,
  type Member,
} from "@/lib/types";
import { formatDateLabel, shiftDateStr, todayStr } from "@/lib/format";
import { TasksColumn } from "./TasksColumn";
import { Icon } from "./Icon";

export function TasksBoard() {
  const [date, setDate] = useState(todayStr);

  return (
    <>
      <div className="mt-5 flex items-center gap-3 rounded-full bg-white px-3 py-2">
        <button
          onClick={() => setDate((d) => shiftDateStr(d, -1))}
          className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-panel"
        >
          <Icon paths='<polyline points="15 18 9 12 15 6"></polyline>' color="#141414" size={16} />
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-ink">{formatDateLabel(date)}</div>
        <button
          onClick={() => setDate((d) => shiftDateStr(d, 1))}
          className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-panel"
        >
          <Icon paths='<polyline points="9 18 15 12 9 6"></polyline>' color="#141414" size={16} />
        </button>
        {date !== todayStr() && (
          <button
            onClick={() => setDate(todayStr())}
            className="flex-none cursor-pointer rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-[#EFEFE9]"
          >
            Today
          </button>
        )}
      </div>

      {/* Keyed by date so switching days remounts with fresh loading state,
          instead of resetting state imperatively inside an effect. */}
      <TasksBoardDay key={date} date={date} />
    </>
  );
}

function TasksBoardDay({ date }: { date: string }) {
  const [items, setItems] = useState<DailyChecklistItem[]>([]);
  const [entries, setEntries] = useState<DailyChecklistEntry[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemLabel, setNewItemLabel] = useState("");

  useEffect(() => {
    fetch(`/api/tasks?date=${date}`)
      .then((res) => res.json())
      .then((body) => {
        setItems(body.items ?? []);
        setEntries(body.entries ?? []);
        setTasks(body.tasks ?? []);
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function toggleChecklist(itemId: string, member: Member) {
    const existing = entries.find((e) => e.item_id === itemId && e.member === member);
    const checked = !(existing?.checked ?? false);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.item_id === itemId && e.member === member);
      if (idx === -1) {
        return [...prev, { id: `${itemId}-${member}`, item_id: itemId, member, date, checked, updated_at: "" }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], checked };
      return next;
    });
    const res = await fetch("/api/tasks/checklist-entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId, member, date, checked }),
    });
    const body = await res.json();
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.item_id === itemId && e.member === member);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = body.entry;
      return next;
    });
  }

  async function addTask(member: Member, text: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member, date, text }),
    });
    const body = await res.json();
    setTasks((prev) => [...prev, body.task]);
  }

  async function toggleTaskDone(task: DailyTask) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  async function addChecklistItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    const res = await fetch("/api/tasks/checklist-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newItemLabel.trim() }),
    });
    const body = await res.json();
    setItems((prev) => [...prev, body.item]);
    setNewItemLabel("");
  }

  async function deleteChecklistItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEntries((prev) => prev.filter((entry) => entry.item_id !== id));
    await fetch(`/api/tasks/checklist-items/${id}`, { method: "DELETE" });
  }

  if (loading) {
    return <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">Loading…</div>;
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] bg-white p-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          Recurring daily items
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 text-xs font-medium text-ink"
            >
              {item.label}
              <button
                onClick={() => deleteChecklistItem(item.id)}
                className="cursor-pointer text-ink/30 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
          <form onSubmit={addChecklistItem} className="flex items-center gap-1.5">
            <input
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              placeholder="+ Add recurring item"
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink outline-none focus:border-ink"
            />
          </form>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {MEMBERS.map((member) => (
          <TasksColumn
            key={member}
            member={member}
            items={items}
            entries={entries.filter((e) => e.member === member)}
            tasks={tasks.filter((t) => t.member === member)}
            onToggleChecklist={(itemId) => toggleChecklist(itemId, member)}
            onAddTask={(text) => addTask(member, text)}
            onToggleTaskDone={toggleTaskDone}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>
    </>
  );
}
