import { NextResponse } from "next/server";
import { createProposal, listProposals } from "@/lib/proposals";
import type { NewProposalInput } from "@/lib/types";

export async function GET() {
  try {
    const proposals = await listProposals();
    return NextResponse.json({ proposals });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewProposalInput;
    if (!body.lead_id) {
      return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
    }
    const proposal = await createProposal(body);
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
