import { NextResponse } from "next/server";
import { createAudit, listAuditsForLead } from "@/lib/audits";
import type { PillarInput, PillarKey } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audits = await listAuditsForLead(id);
    return NextResponse.json({ audits });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      demand: PillarInput;
      revenue: PillarInput;
      operations: PillarInput;
      customer: PillarInput;
      intelligence: PillarInput;
      primary_bottleneck: PillarKey | null;
      business_impact?: string;
      notes?: string;
    };
    const audit = await createAudit({ lead_id: id, ...body });
    return NextResponse.json({ audit }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
