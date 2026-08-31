import { NextResponse } from "next/server";
import { createPayment, listPayments } from "@/lib/payments";
import type { NewPaymentInput } from "@/lib/types";

export async function GET() {
  try {
    const payments = await listPayments();
    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewPaymentInput;
    if (!body.lead_id) {
      return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
    }
    if (body.amount == null || Number.isNaN(Number(body.amount))) {
      return NextResponse.json({ error: "amount is required" }, { status: 400 });
    }
    const payment = await createPayment(body);
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
