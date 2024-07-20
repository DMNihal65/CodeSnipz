import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, code, language } = await req.json();
    
    console.log('Attempting to insert snippet:', { userId, title, description, code, language });

    const newSnippet = await db.insert(snippets).values({
      userId,
      title,
      description,
      code,
      language,
    }).returning();

    console.log('New snippet created:', newSnippet[0]);

    return NextResponse.json(newSnippet[0]);
  } catch (error) {
    console.error('Detailed error creating snippet:', error);
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
  
      const userSnippets = await db.select().from(snippets).where(eq(snippets.userId, userId));
  
      return NextResponse.json(userSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      return new NextResponse(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }