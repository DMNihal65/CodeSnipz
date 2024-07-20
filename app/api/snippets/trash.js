import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { snippetId, isDeleted } = await req.json();

    await db.update(snippets).set({ isDeleted }).where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)));

    return new NextResponse("Trash status updated successfully", { status: 200 });
  } catch (error) {
    console.error('Error updating trash status:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { snippetId } = await req.json();

    await db.delete(snippets).where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)));

    return new NextResponse("Snippet deleted permanently", { status: 200 });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
