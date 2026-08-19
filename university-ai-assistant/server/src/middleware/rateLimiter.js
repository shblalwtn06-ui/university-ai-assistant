import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || 100;

export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

// Stricter limiter specifically for the chat endpoint, since each
// call is expensive (embeddings + LLM generation).
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests. Please slow down.',
  },
});
