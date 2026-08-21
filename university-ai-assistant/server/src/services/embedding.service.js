import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص المراد تضمينه غير صالح');
  }
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function embedChunks(chunks) {
  const embeddings = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const vector = await embedText(chunk.content);
      embeddings.push({
        ...chunk,
        embedding: vector,
      });
      // تأخير بسيط لمنع تجاوز الحد المجاني
      if (i < chunks.length - 1) {
        await new Promise((res) => setTimeout(res, 120));
      }
    } catch (err) {
      console.error(`خطأ في الجزء ${i}:`, err.message);
      throw err;
    }
  }
  return embeddings;
}
