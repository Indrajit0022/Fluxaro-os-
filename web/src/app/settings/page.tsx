import { listIntegrations, listTeamMembers, getWorkspaceSettings } from "@/lib/settings";
import { NotificationToggles } from "@/components/NotificationToggles";
import { TeamSection } from "@/components/TeamSection";
import { IntegrationsSection } from "@/components/IntegrationsSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, members, integrations] = await Promise.all([
    getWorkspaceSettings(),
    listTeamMembers(),
    listIntegrations(),
  ]);

  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Settings</div>
        <div className="mt-1.5 text-sm text-ink/55">Workspace preferences</div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <NotificationToggles settings={settings} />
          <TeamSection members={members} />
          <IntegrationsSection integrations={integrations} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] bg-ink p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-[15px] font-bold text-ink">
              FX
            </div>
            <div className="mt-3.5 text-[15px] font-bold text-white">Fluxaro OS</div>
            <div className="mt-0.5 text-xs text-white/55">
              {members.length} team member{members.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
