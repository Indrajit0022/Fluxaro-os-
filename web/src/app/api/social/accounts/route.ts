import { NextResponse } from "next/server";
import { createSocialAccount, listSocialAccounts } from "@/lib/social";
import type { NewSocialAccountInput } from "@/lib/types";

export async function GET() {
  try {
    const accounts = await listSocialAccounts();
    return NextResponse.json({ accounts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewSocialAccountInput;
    if (!body.platform?.trim() || !body.handle?.trim()) {
      return NextResponse.json({ error: "Platform and handle are required" }, { status: 400 });
    }
    const account = await createSocialAccount(body);
    return NextResponse.json({ account });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
