import { NextResponse } from "next/server";
import { deleteProposal, getProposal, setProposalStatus, updateProposal } from "@/lib/proposals";
import type { NewProposalInput, ProposalStatus } from "@/lib/types";
import { getLead } from "@/lib/leads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposal = await getProposal(id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    const lead = await getLead(proposal.lead_id);
    return NextResponse.json({ proposal, lead });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<NewProposalInput> & { status?: ProposalStatus };

    if (body.status) {
      const proposal = await setProposalStatus(id, body.status);
      return NextResponse.json({ proposal });
    }

    const proposal = await updateProposal(id, body);
    return NextResponse.json({ proposal });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProposal(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
