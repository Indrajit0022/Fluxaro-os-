import { NextResponse } from "next/server";
import { setChecklistEntry } from "@/lib/tasks";
import type { Member } from "@/lib/types";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      item_id: string;
      member: Member;
      date: string;
      checked: boolean;
    };
    const entry = await setChecklistEntry(body.item_id, body.member, body.date, body.checked);
    return NextResponse.json({ entry });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
