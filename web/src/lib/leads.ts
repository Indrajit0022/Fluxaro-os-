import "server-only";
import { supabaseServer } from "./supabase-server";
import type { Lead, NewLeadInput, PipelineStage } from "./types";

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabaseServer
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Lead[];
}

export async function createLead(input: NewLeadInput): Promise<Lead> {
  const { data, error } = await supabaseServer
    .from("leads")
    .insert({
      company: input.company,
      contact_name: input.contact_name ?? null,
      source: input.source ?? null,
      icp_score: input.icp_score ?? null,
      stage: input.stage ?? "new",
      discovery_notes: input.discovery_notes ?? null,
      growth_gap_score: input.growth_gap_score ?? null,
      next_action: input.next_action ?? null,
      deal_value: input.deal_value ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function updateLead(
  id: string,
  patch: Partial<NewLeadInput> & { stage?: PipelineStage }
): Promise<Lead> {
  const { data, error } = await supabaseServer
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabaseServer.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
