import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const allTags = await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId));

    return NextResponse.json(allTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    const newTag = await db
      .insert(tags)
      .values({ userId, name })
      .returning();

    return NextResponse.json(newTag);
  } catch (error) {
    console.error('Error adding tag:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();

    await db
      .delete(tags)
      .where(eq(tags.id, id), eq(tags.userId, userId));

    return new NextResponse("Tag deleted", { status: 200 });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
