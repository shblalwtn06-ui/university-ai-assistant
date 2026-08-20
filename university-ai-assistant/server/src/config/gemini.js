import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const { GEMINI_API_KEY, GEMINI_MODEL } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in environment variables.');
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const chatModel = genAI.getGenerativeModel({
  model: GEMINI_MODEL || 'gemini-1.5-flash',
});

// Embedding model (text-embedding-004 -> 768 dimensions, matches the
// `vector(768)` column defined in supabase/schema.sql)
export const embeddingModel = genAI.getGenerativeModel({
model: 'embedding-001',
});
