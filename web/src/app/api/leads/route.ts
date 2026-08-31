import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/leads";
import type { NewLeadInput } from "@/lib/types";

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewLeadInput;
    if (!body.company || !body.company.trim()) {
      return NextResponse.json(
        { error: "company is required" },
        { status: 400 }
      );
    }
    const lead = await createLead(body);
    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
