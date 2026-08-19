import { supabaseAdmin } from '../config/supabase.js';
import { extractAndChunkPdf } from '../services/pdf.service.js';
import { embedBatch } from '../services/embedding.service.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/upload
 * Admin-only (protected by verifyAdmin middleware).
 * Accepts a single PDF file (multipart/form-data, field name "file")
 * plus a `courseId` field, extracts + chunks + embeds the text, and
 * stores the resulting rows in the `documents` table.
 */
export const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded. Attach a PDF under field "file".', 400);
  }

  const { courseId } = req.body;

  // Confirm the course exists before attaching documents to it.
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError) throw courseError;
  if (!course) {
    throw new AppError('The specified courseId does not exist.', 400);
  }

  const chunks = await extractAndChunkPdf(req.file.buffer);
  const embeddings = await embedBatch(chunks);

  const rows = chunks.map((content, i) => ({
    content,
    embedding: embeddings[i],
    file_name: req.file.originalname,
    chunk_id: i,
    course_id: courseId,
  }));

  const { error: insertError } = await supabaseAdmin.from('documents').insert(rows);
  if (insertError) throw insertError;

  res.status(201).json({
    success: true,
    message: `Uploaded and indexed "${req.file.originalname}" successfully.`,
    chunksIndexed: rows.length,
  });
});
