import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snippets, users } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = sessionClaims.email;

    // Check if user exists in our database
    let user = await db.select().from(users).where(users.email.equals(userEmail)).limit(1);

    // If user doesn't exist, create them
    if (user.length === 0) {
      user = await db.insert(users).values({
        id: uuidv4(),
        email: userEmail,
      }).returning();
      console.log('New user created:', user[0]);
    } else {
      user = user[0];
    }

    const { title, description, code, language } = await req.json();
    
    console.log('Attempting to insert snippet:', { userId: user.id, title, description, code, language });

    const newSnippet = await db.insert(snippets).values({
      id: uuidv4(),
      userId: user.id,
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
} 