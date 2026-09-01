import { NextResponse } from "next/server";
import { createStickyNote, listStickyNotes } from "@/lib/sticky-notes";
import type { NewStickyNoteInput } from "@/lib/types";

export async function GET() {
  try {
    const notes = await listStickyNotes();
    return NextResponse.json({ notes });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewStickyNoteInput;
    if (!body.text?.trim() || !body.author) {
      return NextResponse.json({ error: "author and text are required" }, { status: 400 });
    }
    const note = await createStickyNote({ author: body.author, text: body.text.trim() });
    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
