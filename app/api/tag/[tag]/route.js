import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, tags, snippetTags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { tag } = params;

    const tagData = await db
      .select()
      .from(tags)
      .where(and(eq(tags.name, tag), eq(tags.userId, userId)))
      .limit(1);

    if (!tagData.length) {
      return new NextResponse("Tag not found", { status: 404 });
    }

    const tagId = tagData[0].id;

    const relatedSnippets = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        description: snippets.description,
        code: snippets.code,
        language: snippets.language,
        isFavorite: snippets.isFavorite,
        createdAt: snippets.createdAt,
      })
      .from(snippetTags)
      .innerJoin(snippets, eq(snippetTags.snippetId, snippets.id))
      .where(
        and(
          eq(snippetTags.tagId, tagId),
          eq(snippets.userId, userId),
          eq(snippets.isDeleted, false)
        )
      );

    return NextResponse.json(relatedSnippets);
  } catch (error) {
    console.error('Error fetching snippets by tag:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}