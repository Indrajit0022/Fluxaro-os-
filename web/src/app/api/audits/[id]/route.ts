import { NextResponse } from "next/server";
import { getAudit } from "@/lib/audits";
import { getLead } from "@/lib/leads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = await getAudit(id);
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    const lead = await getLead(audit.lead_id);
    return NextResponse.json({ audit, lead });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
