import { NextResponse } from "next/server";
import { deletePayment, getPayment, setPaymentStatus, updatePayment } from "@/lib/payments";
import type { NewPaymentInput, PaymentStatus } from "@/lib/types";
import { getLead } from "@/lib/leads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await getPayment(id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    const lead = await getLead(payment.lead_id);
    return NextResponse.json({ payment, lead });
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
    const body = (await request.json()) as Partial<NewPaymentInput> & { status?: PaymentStatus };

    if (body.status && Object.keys(body).length === 1) {
      const payment = await setPaymentStatus(id, body.status);
      return NextResponse.json({ payment });
    }

    const payment = await updatePayment(id, body);
    return NextResponse.json({ payment });
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
    await deletePayment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
