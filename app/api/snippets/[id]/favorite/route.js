import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function PATCH(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippetId = parseInt(params.id, 10);
    const { isFavorite } = await req.json();

    const [updatedSnippet] = await db.update(snippets)
      .set({ isFavorite })
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .returning();

    if (!updatedSnippet) {
      return new NextResponse("Snippet not found or unauthorized", { status: 404 });
    }

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating favorite status:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}