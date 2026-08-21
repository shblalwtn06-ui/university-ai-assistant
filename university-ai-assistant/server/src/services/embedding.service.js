import dotenv from 'dotenv';
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * توليد embedding لنص واحد باستخدام Google REST API المباشر
 */
export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص غير صالح');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  // الاستدعاء المباشر لـ Google AI Studio API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: {
        parts: [{ text: text.trim() }],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    // إذا كان text-embedding-004 غير متاح في منطقتك، نجرب embedding-001 فوراً
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`;
    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: text.trim() }],
        },
      }),
    });

    if (!fallbackRes.ok) {
      throw new Error(`Embedding Error: ${errText}`);
    }

    const fallbackData = await fallbackRes.json();
    return fallbackData.embedding.values;
  }

  const data = await response.json();
  return data.embedding.values;
}

/**
 * معالجة جميع قطع ملف الـ PDF بالتتابع
 */
export async function embedBatch(texts) {
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    const text = typeof texts[i] === 'string' ? texts[i] : texts[i].content;
    const vector = await embedText(text);
    vectors.push(vector);

    // تأخير بسيط لتجنب حد السرعة
    if (i < texts.length - 1) {
      await delay(100);
    }
  }
  return vectors;
}

export async function embedChunks(chunks) {
  return embedBatch(chunks);
}
