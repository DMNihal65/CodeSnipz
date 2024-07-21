import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const favoriteSnippets = await db
      .select()
      .from(snippets)
      .where(
        and(
          eq(snippets.userId, userId),
          eq(snippets.isFavorite, true)
        )
      );

    return NextResponse.json(favoriteSnippets);
  } catch (error) {
    console.error('Error fetching favorite snippets:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}