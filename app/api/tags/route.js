import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, snippetTags, snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    
    console.log('Attempting to insert tag:', { userId, name });

    const newTag = await db.insert(tags).values({
      userId,
      name,
    }).returning();

    console.log('New tag created:', newTag[0]);

    return NextResponse.json(newTag[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export async function GET(req) {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const userTags = await db.select().from(tags).where(eq(tags.userId, userId));
  
      return NextResponse.json(userTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      return new NextResponse(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}

export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { snippetId, tagIds } = await req.json();
    
    console.log('Attempting to update snippet tags:', { snippetId, tagIds });

    await db.delete(snippetTags).where(eq(snippetTags.snippetId, snippetId));

    const newSnippetTags = tagIds.map(tagId => ({ snippetId, tagId }));
    await db.insert(snippetTags).values(newSnippetTags);

    return new NextResponse("Tags updated successfully", { status: 200 });
  } catch (error) {
    console.error('Error updating snippet tags:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
