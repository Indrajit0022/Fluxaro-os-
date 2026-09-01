import { listSocialAccounts, listSocialPosts } from "@/lib/social";
import { SocialAccountsSection } from "@/components/SocialAccountsSection";

export const dynamic = "force-dynamic";

export default async function SocialPage() {
  const [accounts, posts] = await Promise.all([listSocialAccounts(), listSocialPosts()]);

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const postedCount = posts.filter((p) => p.status === "posted").length;
  const ideaCount = posts.filter((p) => p.status === "idea" || p.status === "drafted").length;

  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Social Media</div>
        <div className="mt-1.5 text-sm text-ink/55">Fluxaro&apos;s own accounts</div>
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">In the Pipeline</div>
          <div className="text-[26px] font-bold text-ink">{ideaCount}</div>
          <div className="text-[11px] text-ink/50">Ideas &amp; drafts</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Scheduled</div>
          <div className="text-[26px] font-bold text-ink">{scheduledCount}</div>
          <div className="text-[11px] text-ink/50">Ready to publish</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
          <div className="text-[13px] font-medium text-white/60">Posted</div>
          <div className="text-[26px] font-bold text-white">{postedCount}</div>
          <div className="text-[11px] text-white/50">Total published</div>
        </div>
      </div>

      <div className="mt-4">
        <SocialAccountsSection accounts={accounts} />
      </div>
    </>
  );
}
