import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// استخدام النموذج المعتمد للتضمين
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * توليد embedding لنص واحد بأبعاد 768
 */
export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص المراد تضمينه غير صالح');
  }

  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    // إذا ظهر خطأ في text-embedding-004، نجرب النموذج البديل embedding-001
    if (error.message.includes('404') || error.message.includes('not found')) {
      const fallbackModel = genAI.getGenerativeModel({ model: 'embedding-001' });
      const fallbackResult = await fallbackModel.embedContent(text);
      return fallbackResult.embedding.values;
    }
    throw error;
  }
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

    // تأخير 100ms لتجنب تخطي الـ Rate Limit المجاني
    if (i < texts.length - 1) {
      await delay(100);
    }
  }
  return vectors;
}

export async function embedChunks(chunks) {
  return embedBatch(chunks);
}
