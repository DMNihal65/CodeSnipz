import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, snippetTags, tags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippetId = parseInt(params.id, 10);

    const snippetResult = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        description: snippets.description,
        code: snippets.code,
        language: snippets.language,
        isFavorite: snippets.isFavorite,
        createdAt: snippets.createdAt,
      })
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (snippetResult.length === 0) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    const snippet = snippetResult[0];

    const tagsResult = await db
      .select({ name: tags.name })
      .from(snippetTags)
      .innerJoin(tags, eq(snippetTags.tagId, tags.id))
      .where(eq(snippetTags.snippetId, snippetId));

    snippet.tags = tagsResult.map(tag => tag.name);

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

    const snippetId = parseInt(params.id, 10);
    const { title, description, code, language, tags: tagNames } = await req.json();

    // Update the snippet
    const [updated] = await db.update(snippets)
      .set({ title, description, code, language })
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .returning();

    if (!updated) {
      return new NextResponse("Snippet not found or unauthorized", { status: 404 });
    }

    // Remove existing tags
    await db.delete(snippetTags).where(eq(snippetTags.snippetId, snippetId));

    // Add new tags
    for (const tagName of tagNames) {
      let [tag] = await db.select().from(tags).where(and(eq(tags.userId, userId), eq(tags.name, tagName)));

      if (!tag) {
        [tag] = await db.insert(tags).values({ userId, name: tagName }).returning();
      }

      await db.insert(snippetTags).values({ snippetId, tagId: tag.id });
    }

    const updatedSnippet = {
      ...updated,
      tags: tagNames
    };

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}