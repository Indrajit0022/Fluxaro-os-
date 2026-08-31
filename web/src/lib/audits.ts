import "server-only";
import { supabaseServer } from "./supabase-server";
import type { Audit, NewAuditInput, PillarKey } from "./types";
import { PILLAR_LABELS } from "./operating-systems";

const PILLAR_KEYS: PillarKey[] = ["demand", "revenue", "operations", "customer", "intelligence"];

export async function listAudits(): Promise<Audit[]> {
  const { data, error } = await supabaseServer
    .from("audits")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Audit[];
}

export async function getAudit(id: string): Promise<Audit | null> {
  const { data, error } = await supabaseServer
    .from("audits")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Audit | null;
}

export async function listAuditsForLead(leadId: string): Promise<Audit[]> {
  const { data, error } = await supabaseServer
    .from("audits")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Audit[];
}

export async function getLatestAudit(leadId: string): Promise<Audit | null> {
  const audits = await listAuditsForLead(leadId);
  return audits[0] ?? null;
}

export async function createAudit(input: NewAuditInput): Promise<Audit> {
  const row: Record<string, unknown> = {
    lead_id: input.lead_id,
    primary_bottleneck: input.primary_bottleneck,
    business_impact: input.business_impact ?? null,
    notes: input.notes ?? null,
  };
  for (const pillar of PILLAR_KEYS) {
    const p = input[pillar];
    row[`${pillar}_score`] = p.score;
    row[`${pillar}_evidence_type`] = p.evidence_type;
    row[`${pillar}_evidence`] = p.evidence;
  }

  const { data, error } = await supabaseServer.from("audits").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  const audit = data as Audit;

  const { error: activityError } = await supabaseServer.from("lead_activity").insert({
    lead_id: input.lead_id,
    type: "note",
    detail: input.primary_bottleneck
      ? `Growth Gap audit run — primary bottleneck: ${PILLAR_LABELS[input.primary_bottleneck]}`
      : "Growth Gap audit run",
  });
  if (activityError) throw new Error(activityError.message);

  return audit;
}
