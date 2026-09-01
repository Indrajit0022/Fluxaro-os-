import { NextResponse } from "next/server";
import { createTeamMember, listTeamMembers } from "@/lib/settings";
import type { NewTeamMemberInput } from "@/lib/types";

export async function GET() {
  try {
    const members = await listTeamMembers();
    return NextResponse.json({ members });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewTeamMemberInput;
    if (!body.name?.trim() || !body.role?.trim()) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }
    const member = await createTeamMember(body);
    return NextResponse.json({ member });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
