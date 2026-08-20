import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// استخدام النموذج المجاني الرسمي للتضمين
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

/**
 * دالة مساعدة للانتظار بين الطلبات لتجنب تجاوز حد الـ Rate Limit المجاني
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * توليد Embedding لنص واحد بأبعاد 768
 */
export async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // ينتج vector(768) متوافق تماماً
}

/**
 * توليد Embeddings لمجموعة نصوص (دفعة من أجزاء الـ PDF)
 * مع حماية من استهلاك الـ Quota المجانية
 */
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

      // إضافة تأخير بسيط (100ms) بين كل جزء لضمان عدم حظر الـ API المجاني
      if (i < chunks.length - 1) {
        await delay(100);
      }
    } catch (error) {
      console.error(`خطأ في تضمين الجزء رقم ${i}:`, error.message);
      // إذا حدث ضغط على الحصة، ننتظر ثانيتين ونحاول مرة أخرى
      if (error.status === 429 || error.message.includes('Quota')) {
        console.log('تم الوصول لحد الطلبات، جاري الانتظار 2 ثانية ثم المحاولة...');
        await delay(2000);
        const retryVector = await embedText(chunk.content);
        embeddings.push({
          ...chunk,
          embedding: retryVector,
        });
      } else {
        throw error;
      }
    }
  }

  return embeddings;
}
