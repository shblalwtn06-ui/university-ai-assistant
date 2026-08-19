import { supabaseAdmin } from '../config/supabase.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/students/me
 * Returns the current student's profile, or `student: null` if the
 * user has not completed onboarding yet (frontend shows the modal).
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, student: req.student });
});

/**
 * POST /api/students/onboard
 * Creates the student's profile row on first login, binding their
 * Supabase auth account to an academic_id.
 */
export const onboardStudent = asyncHandler(async (req, res) => {
  if (req.student) {
    throw new AppError('Student profile already exists.', 409);
  }

  const { academicId, fullName } = req.body;

  const { data: existing } = await supabaseAdmin
    .from('students')
    .select('id')
    .eq('academic_id', academicId)
    .maybeSingle();

  if (existing) {
    throw new AppError('This academic ID is already registered to another account.', 409);
  }

  const { data, error } = await supabaseAdmin
    .from('students')
    .insert({
      id: req.user.id,
      email: req.user.email,
      full_name: fullName,
      academic_id: academicId,
    })
    .select('*')
    .single();

  if (error) throw error;

  res.status(201).json({ success: true, student: data });
});
