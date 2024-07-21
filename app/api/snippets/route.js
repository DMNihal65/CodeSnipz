// api/snippets/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, tags, snippetTags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, code, language, tags: tagNames } = await req.json();

    console.log('Attempting to insert snippet:', { userId, title, description, code, language, tagNames });

    // Insert the snippet
    const [insertedSnippet] = await db.insert(snippets).values({
      userId,
      title,
      description,
      code,
      language,
    }).returning();

    // Handle tags
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        let [tag] = await db.select().from(tags).where(and(eq(tags.userId, userId), eq(tags.name, tagName)));

        if (!tag) {
          [tag] = await db.insert(tags).values({ userId, name: tagName }).returning();
        }

        await db.insert(snippetTags).values({ snippetId: insertedSnippet.id, tagId: tag.id });
      }
    }

    console.log('New snippet created:', insertedSnippet);

    return NextResponse.json(insertedSnippet);
  } catch (error) {
    console.error('Detailed error creating snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSnippets = await db.select({
      id: snippets.id,
      title: snippets.title,
      description: snippets.description,
      code: snippets.code,
      language: snippets.language,
      isFavorite: snippets.isFavorite,
      createdAt: snippets.createdAt,
      tags: tags.name
    })
    .from(snippets)
    .leftJoin(snippetTags, eq(snippetTags.snippetId, snippets.id))
    .leftJoin(tags, eq(tags.id, snippetTags.tagId))
    .where(eq(snippets.userId, userId))
    .orderBy(snippets.createdAt);

    // Group tags for each snippet
    const groupedSnippets = userSnippets.reduce((acc, cur) => {
      const existingSnippet = acc.find(s => s.id === cur.id);
      if (existingSnippet) {
        if (cur.tags) existingSnippet.tags.push(cur.tags);
      } else {
        acc.push({...cur, tags: cur.tags ? [cur.tags] : []});
      }
      return acc;
    }, []);

    return NextResponse.json(groupedSnippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
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
    const { title, description, code, language, tags: tagNames } = await req.json();

    // Update the snippet
    const [updatedSnippet] = await db.update(snippets)
      .set({ title, description, code, language })
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .returning();

    if (!updatedSnippet) {
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

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

