import { NextResponse } from "next/server";
import { listPaymentsForLead } from "@/lib/payments";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payments = await listPaymentsForLead(id);
    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
