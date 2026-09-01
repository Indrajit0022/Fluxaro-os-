import { TasksBoard } from "@/components/TasksBoard";

export default function TasksPage() {
  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Tasks</div>
        <div className="mt-1.5 text-sm text-ink/55">What Indrajit and Aditya are each working on, by day</div>
      </div>
      <TasksBoard />
    </>
  );
}
