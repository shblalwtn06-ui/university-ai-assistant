/**
 * verifyAdmin
 * -----------
 * Protects admin-only routes (e.g. POST /api/upload) with a shared
 * secret sent via the `X-Upload-Secret` header. Rejects with 403
 * when the header is missing or does not match ADMIN_UPLOAD_SECRET.
 */
export function verifyAdmin(req, res, next) {
  const providedSecret = req.headers['x-upload-secret'];
  const expectedSecret = process.env.ADMIN_UPLOAD_SECRET;

  if (!expectedSecret) {
    return res.status(500).json({
      success: false,
      message: 'Server misconfiguration: ADMIN_UPLOAD_SECRET is not set.',
    });
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: invalid or missing admin upload secret.',
    });
  }

  return next();
}
