import { NextResponse } from "next/server";
import { listProposalsForLead } from "@/lib/proposals";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposals = await listProposalsForLead(id);
    return NextResponse.json({ proposals });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
