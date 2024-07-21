// utils/GeminiAiModel.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export const generateCodeComments = async (code, language) => {
  const prompt = `Here is a code snippet in ${language}:\n\n${code}\n\nPlease add comments to this code to explain its functionality.`;
  
  try {
    const response = await model.generate({
      prompt,
      generationConfig,
    });

    // Extract the commented code from the response
    const commentedCode = response.text().trim();
    return commentedCode;
  } catch (error) {
    console.error('Error while generating code comments:', error);
    throw new Error('Failed to generate code comments');
  }
};
