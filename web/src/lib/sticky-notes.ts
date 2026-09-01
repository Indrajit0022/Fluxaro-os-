import "server-only";
import { supabaseServer } from "./supabase-server";
import type { NewStickyNoteInput, StickyNote } from "./types";

export async function listStickyNotes(): Promise<StickyNote[]> {
  const { data, error } = await supabaseServer
    .from("sticky_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as StickyNote[];
}

export async function createStickyNote(input: NewStickyNoteInput): Promise<StickyNote> {
  const { data, error } = await supabaseServer
    .from("sticky_notes")
    .insert({ author: input.author, text: input.text })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as StickyNote;
}

export async function deleteStickyNote(id: string): Promise<void> {
  const { error } = await supabaseServer.from("sticky_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
