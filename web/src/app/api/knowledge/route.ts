import { NextResponse } from "next/server";
import { createKnowledgeDocument, listKnowledgeDocuments } from "@/lib/knowledge";
import type { NewKnowledgeDocumentInput } from "@/lib/types";

export async function GET() {
  try {
    const documents = await listKnowledgeDocuments();
    return NextResponse.json({ documents });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewKnowledgeDocumentInput;
    if (!body.title?.trim() || !body.content?.trim() || !body.category) {
      return NextResponse.json({ error: "Title, category, and content are required" }, { status: 400 });
    }
    const document = await createKnowledgeDocument(body);
    return NextResponse.json({ document });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
