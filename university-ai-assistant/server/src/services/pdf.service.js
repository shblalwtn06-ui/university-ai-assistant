import pdfParse from 'pdf-parse';
import { cleanText, chunkText } from '../utils/textChunker.js';
import { AppError } from '../middleware/errorHandler.js';

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE) || 1000;
const CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP) || 200;

/**
 * extractAndChunkPdf
 * -------------------
 * Extracts raw text from a PDF buffer, cleans it, and splits it into
 * overlapping chunks ready for embedding.
 *
 * @param {Buffer} fileBuffer
 * @returns {Promise<string[]>} array of text chunks
 */
export async function extractAndChunkPdf(fileBuffer) {
  let parsed;
  try {
    parsed = await pdfParse(fileBuffer);
  } catch (err) {
    throw new AppError(`Failed to parse PDF: ${err.message}`, 400);
  }

  const cleaned = cleanText(parsed.text || '');

  if (!cleaned || cleaned.length < 20) {
    throw new AppError(
      'The PDF appears to be empty or contains no extractable text (it may be a scanned image).',
      400
    );
  }

  return chunkText(cleaned, CHUNK_SIZE, CHUNK_OVERLAP);
}
