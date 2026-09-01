import { NextResponse } from "next/server";
import { setIntegrationConnected } from "@/lib/settings";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { connected: boolean };
    const integration = await setIntegrationConnected(id, body.connected);
    return NextResponse.json({ integration });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
