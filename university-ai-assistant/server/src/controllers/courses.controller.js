import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/** GET /api/courses — list all courses for the sidebar. */
export const listCourses = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  res.json({ success: true, courses: data });
});
