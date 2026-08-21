import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * توليد embedding لنص واحد (يُستخدم في RAG للبحث عن السؤال)
 */
export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص المراد تضمينه غير صالح');
  }
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

/**
 * توليد embeddings لمصفوفة من النصوص (يُستخدم في رفع الـ PDF)
 */
export async function embedBatch(texts) {
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    const text = typeof texts[i] === 'string' ? texts[i] : texts[i].content;
    const vector = await embedText(text);
    vectors.push(vector);
    
    // تأخير 100ms لتجنب تخطي الحد المجاني لـ Gemini
    if (i < texts.length - 1) {
      await delay(100);
    }
  }
  return vectors;
}

export async function embedChunks(chunks) {
  return embedBatch(chunks);
}
