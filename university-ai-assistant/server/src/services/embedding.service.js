import { embeddingModel } from '../config/gemini.js';

/**
 * embedText
 * ---------
 * Generates a single 768-dimension embedding vector for a piece of
 * text using Gemini's text-embedding-004 model.
 */
export async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // number[768]
}

/**
 * embedBatch
 * ----------
 * Embeds an array of text chunks sequentially with a small
 * concurrency window, to stay within API rate limits while still
 * being reasonably fast for large PDFs.
 */
export async function embedBatch(textChunks, concurrency = 5) {
  const results = new Array(textChunks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < textChunks.length) {
      const index = cursor++;
      results[index] = await embedText(textChunks[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, textChunks.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}
