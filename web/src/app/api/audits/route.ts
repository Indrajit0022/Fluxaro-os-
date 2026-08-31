import { NextResponse } from "next/server";
import { listAudits } from "@/lib/audits";

export async function GET() {
  try {
    const audits = await listAudits();
    return NextResponse.json({ audits });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
