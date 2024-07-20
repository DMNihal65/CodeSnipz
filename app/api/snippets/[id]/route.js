import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippetId = params.id;

    if (!snippetId) {
      return new NextResponse("Snippet ID is required", { status: 400 });
    }

    // Fetching the snippet using limit and offset if `.first()` is not available
    const [snippet] = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId), eq(snippets.userId, userId))
      .limit(1); // Limit to 1 item

    if (!snippet) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippetId = params.id;
    const { title, description, code, language, tags } = await req.json();

    if (!snippetId) {
      return new NextResponse("Snippet ID is required", { status: 400 });
    }

    const [updatedSnippet] = await db
      .update(snippets)
      .set({
        title,
        description,
        code,
        language,
        tags,
        updatedAt: new Date(),
      })
      .where(eq(snippets.id, snippetId), eq(snippets.userId, userId))
      .returning();

    if (!updatedSnippet) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
