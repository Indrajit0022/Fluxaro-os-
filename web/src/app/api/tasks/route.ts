import { NextResponse } from "next/server";
import {
  createDailyTask,
  listChecklistEntriesForDate,
  listChecklistItems,
  listDailyTasksForDate,
} from "@/lib/tasks";
import type { NewDailyTaskInput } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "date query param is required" }, { status: 400 });
    }
    const [items, entries, tasks] = await Promise.all([
      listChecklistItems(),
      listChecklistEntriesForDate(date),
      listDailyTasksForDate(date),
    ]);
    return NextResponse.json({ items, entries, tasks });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewDailyTaskInput;
    if (!body.text?.trim() || !body.member || !body.date) {
      return NextResponse.json({ error: "member, date, and text are required" }, { status: 400 });
    }
    const task = await createDailyTask({ ...body, text: body.text.trim() });
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
