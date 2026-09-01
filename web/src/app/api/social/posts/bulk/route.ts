import { NextResponse } from "next/server";
import { createSocialPostsBulk } from "@/lib/social";
import type { NewSocialPostInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { posts: NewSocialPostInput[] };
    if (!body.posts?.length) {
      return NextResponse.json({ error: "posts array is required" }, { status: 400 });
    }
    const invalid = body.posts.find((p) => !p.title?.trim());
    if (invalid) {
      return NextResponse.json({ error: "Every post needs a title" }, { status: 400 });
    }
    const posts = await createSocialPostsBulk(body.posts);
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
