import { supabaseAdmin } from '../config/supabase.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/files
 * Returns a distinct list of uploaded files (grouped by file_name +
 * course_id) with their chunk counts, for the sidebar file list.
 */
export const listFiles = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('file_name, course_id, chunk_id')
    .order('file_name', { ascending: true });

  if (error) throw error;

  const grouped = new Map();
  for (const row of data) {
    const key = `${row.course_id}::${row.file_name}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        fileName: row.file_name,
        courseId: row.course_id,
        chunkCount: 0,
      });
    }
    grouped.get(key).chunkCount += 1;
  }

  res.json({ success: true, files: Array.from(grouped.values()) });
});

/**
 * DELETE /api/files/:id
 * Deletes all document chunks matching a given file_name for a
 * course. `:id` is expected to be `<courseId>::<fileName>` (URL
 * encoded) as produced by listFiles above.
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const decoded = decodeURIComponent(req.params.id);
  const [courseId, fileName] = decoded.split('::');

  if (!courseId || !fileName) {
    throw new AppError('Invalid file identifier. Expected "<courseId>::<fileName>".', 400);
  }

  const { error, count } = await supabaseAdmin
    .from('documents')
    .delete({ count: 'exact' })
    .eq('course_id', courseId)
    .eq('file_name', fileName);

  if (error) throw error;

  res.json({
    success: true,
    message: `Deleted ${count ?? 0} chunk(s) for "${fileName}".`,
  });
});
