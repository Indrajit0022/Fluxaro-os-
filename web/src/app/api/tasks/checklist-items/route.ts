import { NextResponse } from "next/server";
import { createChecklistItem } from "@/lib/tasks";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { label: string };
    if (!body.label?.trim()) {
      return NextResponse.json({ error: "label is required" }, { status: 400 });
    }
    const item = await createChecklistItem(body.label.trim());
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
