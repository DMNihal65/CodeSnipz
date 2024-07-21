// app/api/gemini-ai-comments/route.js

import { generateCodeComments } from '@/utils/GeminiAiModel';
import { NextResponse } from 'next/server';
// import { generateCodeComments } from '@/utils/GeminiAiModel'; // Adjust the import path if necessary

export async function POST(request) {
    console.log('Received request:', request);
    try {
      const { code, language } = await request.json();
      console.log('Request body:', { code, language });
  
      if (!code || !language) {
        return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
      }
  
      const commentedCode = await generateCodeComments(code, language);
      return NextResponse.json({ commentedCode });
    } catch (error) {
      console.error('Error generating code comments:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }