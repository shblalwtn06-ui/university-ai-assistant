import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }
  return new GoogleGenerativeAI(apiKey);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * توليد embedding لنص واحد بأبعاد 768
 */
export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص المراد تضمينه غير صالح');
  }

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'text-embedding-004' });

  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw error;
  }
}

/**
 * توليد embeddings لمصفوفة من النصوص
 */
export async function embedBatch(texts) {
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    const text = typeof texts[i] === 'string' ? texts[i] : texts[i].content;
    const vector = await embedText(text);
    vectors.push(vector);

    if (i < texts.length - 1) {
      await delay(120);
    }
  }
  return vectors;
}

export async function embedChunks(chunks) {
  return embedBatch(chunks);
}
