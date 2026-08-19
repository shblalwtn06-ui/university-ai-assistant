import { supabaseAdmin } from '../config/supabase.js';

/**
 * verifyUser
 * ----------
 * Protects routes by validating the Supabase JWT sent in the
 * `Authorization: Bearer <token>` header. On success, attaches the
 * authenticated user's Supabase auth record to `req.user` and their
 * row from `public.students` (if it exists) to `req.student`.
 */
export async function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Missing or malformed Authorization header.',
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.',
      });
    }

    req.user = data.user;

    // Attach the student profile row (may be null if onboarding
    // has not been completed yet — the frontend handles that case).
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    req.student = student || null;

    return next();
  } catch (err) {
    return next(err);
  }
}
