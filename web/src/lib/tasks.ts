import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  DailyChecklistEntry,
  DailyChecklistItem,
  DailyTask,
  Member,
  NewDailyTaskInput,
} from "./types";

export async function listChecklistItems(): Promise<DailyChecklistItem[]> {
  const { data, error } = await supabaseServer
    .from("daily_checklist_items")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as DailyChecklistItem[];
}

export async function createChecklistItem(label: string): Promise<DailyChecklistItem> {
  const { data, error } = await supabaseServer
    .from("daily_checklist_items")
    .insert({ label })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DailyChecklistItem;
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabaseServer.from("daily_checklist_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listChecklistEntriesForDate(date: string): Promise<DailyChecklistEntry[]> {
  const { data, error } = await supabaseServer
    .from("daily_checklist_entries")
    .select("*")
    .eq("date", date);
  if (error) throw new Error(error.message);
  return data as DailyChecklistEntry[];
}

export async function setChecklistEntry(
  itemId: string,
  member: Member,
  date: string,
  checked: boolean
): Promise<DailyChecklistEntry> {
  const { data, error } = await supabaseServer
    .from("daily_checklist_entries")
    .upsert(
      { item_id: itemId, member, date, checked },
      { onConflict: "item_id,member,date" }
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DailyChecklistEntry;
}

export async function listDailyTasksForDate(date: string): Promise<DailyTask[]> {
  const { data, error } = await supabaseServer
    .from("daily_tasks")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as DailyTask[];
}

export async function createDailyTask(input: NewDailyTaskInput): Promise<DailyTask> {
  const { data, error } = await supabaseServer
    .from("daily_tasks")
    .insert({ member: input.member, date: input.date, text: input.text })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DailyTask;
}

export async function setDailyTaskDone(id: string, done: boolean): Promise<DailyTask> {
  const { data, error } = await supabaseServer
    .from("daily_tasks")
    .update({ done })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DailyTask;
}

export async function deleteDailyTask(id: string): Promise<void> {
  const { error } = await supabaseServer.from("daily_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
