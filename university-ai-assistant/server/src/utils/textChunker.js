/**
 * cleanText
 * ---------
 * Normalizes whitespace and strips control characters from raw
 * PDF-extracted text before chunking.
 */
export function cleanText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * chunkText
 * ---------
 * Splits cleaned text into overlapping chunks so that context is not
 * lost at chunk boundaries. Chunk size and overlap are measured in
 * characters and are configurable via env vars.
 *
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} chunkOverlap
 * @returns {string[]} array of text chunks
 */
export function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
  if (chunkOverlap >= chunkSize) {
    throw new Error('chunkOverlap must be smaller than chunkSize.');
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let sliceEnd = end;

    // Try to break on a sentence/paragraph boundary near the end of
    // the window, so we don't cut a sentence in half when possible.
    if (end < text.length) {
      const lastBreak = text.lastIndexOf('\n', end);
      const lastPeriod = text.lastIndexOf('. ', end);
      const boundary = Math.max(lastBreak, lastPeriod);
      if (boundary > start + chunkSize * 0.5) {
        sliceEnd = boundary + 1;
      }
    }

    const chunk = text.slice(start, sliceEnd).trim();
    if (chunk.length > 0) chunks.push(chunk);

    if (sliceEnd >= text.length) break;
    start = sliceEnd - chunkOverlap;
    if (start < 0) start = 0;
  }

  return chunks;
}
