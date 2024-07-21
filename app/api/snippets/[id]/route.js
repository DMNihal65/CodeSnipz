import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, snippetTags, tags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippetId = params.id;

    const snippet = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId), eq(snippets.userId, userId))
      .single();

    if (!snippet) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    const tagsResult = await db
      .select(tags.name)
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

    const snippetId = params.id;
    const { title, description, code, language, tags } = await req.json();

    const updatedSnippet = await db
      .update(snippets)
      .set({ title, description, code, language })
      .where(eq(snippets.id, snippetId), eq(snippets.userId, userId))
      .returning();

    // Update tags
    await db.delete(snippetTags).where(eq(snippetTags.snippetId, snippetId));

    for (const tagName of tags) {
      const tag = await db
        .select()
        .from(tags)
        .where(eq(tags.name, tagName))
        .single();

      let tagId;
      if (tag) {
        tagId = tag.id;
      } else {
        const newTag = await db
          .insert(tags)
          .values({ userId, name: tagName })
          .returning();
        tagId = newTag.id;
      }

      await db.insert(snippetTags).values({ snippetId, tagId });
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
