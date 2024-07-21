// api/gemini-ai-comments/route.js
import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://gemini-ai-api-url.com/comment-code';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req) {
  try {
    const { code, language } = await req.json();

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Add comments to the following ${language} code: \n\n${code}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI comments');
    }

    const data = await response.json();
    const commentedCode = data.commentedCode;

    return NextResponse.json({ commentedCode });
  } catch (error) {
    console.error('Error getting AI comments:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
