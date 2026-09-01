import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  Integration,
  NewTeamMemberInput,
  TeamMember,
  WorkspaceSettings,
  WorkspaceSettingsPatch,
} from "./types";

export async function listTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabaseServer
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as TeamMember[];
}

export async function createTeamMember(input: NewTeamMemberInput): Promise<TeamMember> {
  const { data, error } = await supabaseServer
    .from("team_members")
    .insert({ name: input.name, role: input.role })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as TeamMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabaseServer.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabaseServer
    .from("integrations")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Integration[];
}

export async function setIntegrationConnected(id: string, connected: boolean): Promise<Integration> {
  const { data, error } = await supabaseServer
    .from("integrations")
    .update({ connected })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Integration;
}

export async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  const { data, error } = await supabaseServer
    .from("workspace_settings")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw new Error(error.message);
  return data as WorkspaceSettings;
}

export async function updateWorkspaceSettings(
  patch: WorkspaceSettingsPatch
): Promise<WorkspaceSettings> {
  const { data, error } = await supabaseServer
    .from("workspace_settings")
    .update(patch)
    .eq("id", true)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WorkspaceSettings;
}
