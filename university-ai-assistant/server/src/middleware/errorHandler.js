/**
 * Global error handler — must be registered last, after all routes.
 * Catches errors passed via next(err) as well as thrown errors from
 * async route handlers wrapped with asyncHandler().
 */
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Wraps an async route handler so thrown errors / rejected promises
 * are forwarded to the global error handler instead of crashing the
 * process or hanging the request.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
