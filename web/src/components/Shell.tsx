import { AgentPanelProvider } from "./AgentPanelContext";
import { AgentPanel } from "./AgentPanel";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AgentPanelProvider>
      <div className="flex h-screen w-full gap-0 bg-sage p-4">
        <Sidebar />
        <div className="flex-1 overflow-y-auto rounded-r-[24px] bg-panel px-8 py-7">
          {children}
        </div>
      </div>
      <AgentPanel />
    </AgentPanelProvider>
  );
}
