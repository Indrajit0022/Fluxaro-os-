import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  NewSocialAccountInput,
  NewSocialPostInput,
  SocialAccount,
  SocialPost,
} from "./types";

export async function listSocialAccounts(): Promise<SocialAccount[]> {
  const { data, error } = await supabaseServer
    .from("social_accounts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as SocialAccount[];
}

export async function createSocialAccount(input: NewSocialAccountInput): Promise<SocialAccount> {
  const { data, error } = await supabaseServer
    .from("social_accounts")
    .insert({ platform: input.platform, handle: input.handle, url: input.url ?? null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as SocialAccount;
}

export async function setSocialAccountActive(id: string, active: boolean): Promise<SocialAccount> {
  const { data, error } = await supabaseServer
    .from("social_accounts")
    .update({ active })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as SocialAccount;
}

export async function deleteSocialAccount(id: string): Promise<void> {
  const { error } = await supabaseServer.from("social_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listSocialPosts(): Promise<SocialPost[]> {
  const { data, error } = await supabaseServer
    .from("social_posts")
    .select("*")
    .order("scheduled_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data as SocialPost[];
}

export async function getSocialPost(id: string): Promise<SocialPost | null> {
  const { data, error } = await supabaseServer
    .from("social_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SocialPost | null;
}

export async function createSocialPost(input: NewSocialPostInput): Promise<SocialPost> {
  const { data, error } = await supabaseServer
    .from("social_posts")
    .insert({
      account_id: input.account_id ?? null,
      title: input.title,
      content: input.content ?? null,
      pillar: input.pillar ?? null,
      status: input.status ?? "idea",
      scheduled_date: input.scheduled_date ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as SocialPost;
}

export async function createSocialPostsBulk(inputs: NewSocialPostInput[]): Promise<SocialPost[]> {
  const rows = inputs.map((input) => ({
    account_id: input.account_id ?? null,
    title: input.title,
    content: input.content ?? null,
    pillar: input.pillar ?? null,
    status: input.status ?? "idea",
    scheduled_date: input.scheduled_date ?? null,
  }));
  const { data, error } = await supabaseServer.from("social_posts").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return data as SocialPost[];
}

export async function updateSocialPost(
  id: string,
  patch: Partial<NewSocialPostInput>
): Promise<SocialPost> {
  const { data, error } = await supabaseServer
    .from("social_posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as SocialPost;
}

export async function deleteSocialPost(id: string): Promise<void> {
  const { error } = await supabaseServer.from("social_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSocialPostsBulk(ids: string[]): Promise<void> {
  const { error } = await supabaseServer.from("social_posts").delete().in("id", ids);
  if (error) throw new Error(error.message);
}
