// api/tags/route.js
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

    const userTags = await db.select().from(tags).where(eq(tags.userId, userId)).orderBy(tags.name);

    return NextResponse.json(userTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
