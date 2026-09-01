import { NextResponse } from "next/server";
import { createSocialPost, listSocialPosts } from "@/lib/social";
import type { NewSocialPostInput } from "@/lib/types";

export async function GET() {
  try {
    const posts = await listSocialPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewSocialPostInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const post = await createSocialPost(body);
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
