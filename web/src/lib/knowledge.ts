import "server-only";
import { supabaseServer } from "./supabase-server";
import type { KnowledgeDocument, NewKnowledgeDocumentInput } from "./types";

export async function listKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const { data, error } = await supabaseServer
    .from("knowledge_documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as KnowledgeDocument[];
}

export async function getKnowledgeDocument(id: string): Promise<KnowledgeDocument | null> {
  const { data, error } = await supabaseServer
    .from("knowledge_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as KnowledgeDocument | null;
}

export async function createKnowledgeDocument(
  input: NewKnowledgeDocumentInput
): Promise<KnowledgeDocument> {
  const { data, error } = await supabaseServer
    .from("knowledge_documents")
    .insert({
      title: input.title,
      category: input.category,
      content: input.content,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as KnowledgeDocument;
}

export async function updateKnowledgeDocument(
  id: string,
  patch: Partial<NewKnowledgeDocumentInput>
): Promise<KnowledgeDocument> {
  const { data, error } = await supabaseServer
    .from("knowledge_documents")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as KnowledgeDocument;
}

export async function deleteKnowledgeDocument(id: string): Promise<void> {
  const { error } = await supabaseServer.from("knowledge_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
