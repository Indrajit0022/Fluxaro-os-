import "server-only";
import { supabaseServer } from "./supabase-server";
import type { NewPaymentInput, Payment, PaymentStatus } from "./types";

export async function listPayments(): Promise<Payment[]> {
  const { data, error } = await supabaseServer
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function listPaymentsForLead(leadId: string): Promise<Payment[]> {
  const { data, error } = await supabaseServer
    .from("payments")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { data, error } = await supabaseServer
    .from("payments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Payment | null;
}

async function logActivity(leadId: string, detail: string): Promise<void> {
  const { error } = await supabaseServer
    .from("lead_activity")
    .insert({ lead_id: leadId, type: "note", detail });
  if (error) throw new Error(error.message);
}

export async function createPayment(input: NewPaymentInput): Promise<Payment> {
  const { data, error } = await supabaseServer
    .from("payments")
    .insert({
      lead_id: input.lead_id,
      project: input.project ?? null,
      milestone: input.milestone ?? null,
      amount: input.amount,
      method: input.method ?? null,
      status: input.status ?? "pending",
      date_received: input.date_received ?? null,
      expected_date: input.expected_date ?? null,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const payment = data as Payment;
  await logActivity(
    input.lead_id,
    `Payment logged: $${input.amount.toLocaleString("en-US")}${input.milestone ? ` (${input.milestone})` : ""}`
  );
  return payment;
}

export async function updatePayment(id: string, patch: Partial<NewPaymentInput>): Promise<Payment> {
  const { data, error } = await supabaseServer
    .from("payments")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function setPaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
  const patch: Record<string, unknown> = { status };
  if (status === "received") patch.date_received = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseServer
    .from("payments")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const payment = data as Payment;
  await logActivity(payment.lead_id, `Payment marked ${status}: $${payment.amount.toLocaleString("en-US")}`);
  return payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabaseServer.from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
