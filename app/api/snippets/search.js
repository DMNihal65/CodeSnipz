import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, snippetTags, tags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and, ilike, inArray } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { query, language, tagIds } = await req.json();
    
    let searchQuery = db.select().from(snippets).where(eq(snippets.userId, userId));

    if (query) {
      searchQuery = searchQuery.where(
        or(
          ilike(snippets.title, `%${query}%`),
          ilike(snippets.description, `%${query}%`),
          ilike(snippets.code, `%${query}%`)
        )
      );
    }

    if (language) {
      searchQuery = searchQuery.where(eq(snippets.language, language));
    }

    if (tagIds && tagIds.length > 0) {
      const snippetIdsWithTags = await db
        .select({ snippetId: snippetTags.snippetId })
        .from(snippetTags)
        .where(inArray(snippetTags.tagId, tagIds));

      const snippetIds = snippetIdsWithTags.map(record => record.snippetId);

      searchQuery = searchQuery.where(inArray(snippets.id, snippetIds));
    }

    const searchResults = await searchQuery;

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Error performing search:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
